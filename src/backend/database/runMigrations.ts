import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { db } from './store.js';

export async function runDatabaseMigrationsAndSeed() {
  console.log('----------------------------------------------------');
  console.log('🚀 Tap Review AI - Database Migration & Seed Engine');
  console.log('----------------------------------------------------');

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const pgHost = process.env.PGHOST || process.env.POSTGRES_HOST;

  if (connectionString || pgHost) {
    console.log('🔗 PostgreSQL Database configuration detected!');
    const isLocalhost = connectionString ? (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) : false;
    const client = new pg.Client({
      connectionString: connectionString || undefined,
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'tapreview',
      ssl: isLocalhost ? undefined : (process.env.PGSSL === 'false' ? undefined : { rejectUnauthorized: true }),
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database server.');

      // Run all SQL files in migrations/ (except the main seed 002_seed_data.sql) in lexicographic order.
      const migrationsDir = path.join(process.cwd(), 'migrations');
      const allFiles = fs.existsSync(migrationsDir) ? fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort() : [];
      console.log('⚙️ Executing SQL migration files (excluding 002_seed_data.sql) in migrations/ ...');
      for (const file of allFiles) {
        if (file === '002_seed_data.sql') continue;
        const filePath = path.join(migrationsDir, file);
        try {
          const sql = fs.readFileSync(filePath, 'utf8');
          console.log(`⚙️ Executing ${file}...`);
          await client.query(sql);
          console.log(`✅ Executed ${file}`);
        } catch (e: any) {
          console.warn(`⚠️ Skipping ${file} due to error: ${e.message}`);
        }
      }

      // Now execute the main seed file
      const seedPath = path.join(process.cwd(), 'migrations', '002_seed_data.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log('🌱 Executing Dummy Seed Data (002_seed_data.sql)...');
        await client.query(seedSql);
        console.log('✅ PostgreSQL Seed Data inserted successfully (Smile Dental Clinic, Bright Coaching, Green Mart, Plans, Ads, Configs).');
      } else {
        console.log('ℹ️ No seed file 002_seed_data.sql found; skipping seed step.');
      }

      // 9. Upsert core seed users (admin@agency.com & owner@business.com) with valid bcrypt hashed password
      console.log('🔐 Seeding & Syncing Core User Accounts (admin@agency.com, owner@business.com)...');
      const seedPasswordHash = bcrypt.hashSync('password123', 10);

      await client.query(`
        INSERT INTO users (id, email, name, role, business_id, password, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          role = EXCLUDED.role,
          password = EXCLUDED.password,
          status = 'ACTIVE'
      `, ['user-admin-1', 'admin@agency.com', 'Agency Super Admin', 'AGENCY_ADMIN', null, seedPasswordHash, 'ACTIVE']);

      await client.query(`
        INSERT INTO users (id, email, name, role, business_id, password, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          role = EXCLUDED.role,
          business_id = COALESCE(users.business_id, EXCLUDED.business_id),
          password = EXCLUDED.password,
          status = 'ACTIVE'
      `, ['user-owner-smile', 'owner@business.com', 'Dr. Michael Carter', 'BUSINESS_OWNER', 'biz-smile-dental', seedPasswordHash, 'ACTIVE']);

      await client.query(`UPDATE users SET password = $1 WHERE password IS NULL OR password = '' OR password = 'password123' OR password LIKE '$2a$10$wTz6CgKx%'`, [seedPasswordHash]);

      console.log('✅ Core User Accounts (admin@agency.com & owner@business.com) verified/updated.');

      await client.end();
      console.log('🎉 Database setup complete for PostgreSQL!');
      return { success: true, mode: 'POSTGRES' };
    } catch (err: any) {
      console.error('❌ PostgreSQL Migration Error:', err.message);
      console.log('🔄 Falling back to built-in in-memory state engine...');
    }
  } else {
    console.log('ℹ️ No active PostgreSQL DATABASE_URL found in environment variables.');
    console.log('📦 Initializing built-in in-memory state engine with pre-seeded dummy data...');
  }

  // Fallback or local store verification
  const bList = await db.getBusinesses();
  const brList = await db.getBranches();
  const pList = await db.getPlans();
  const aList = await db.getAds();
  console.log(`✅ Default Store initialized with ${bList.length} businesses, ${brList.length} branches, ${pList.length} plans, and ${aList.length} ad banners.`);
  console.log('----------------------------------------------------');
  return { success: true, mode: 'IN_MEMORY' };
}

// Run execution only when run directly as CLI entry script
const isMainScript = process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('runMigrations');
if (isMainScript) {
  runDatabaseMigrationsAndSeed().catch(console.error);
}
