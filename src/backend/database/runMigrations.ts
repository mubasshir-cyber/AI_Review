import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { db } from './store';

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

      // 1. Run Schema Migration SQL
      const schemaPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('⚙️ Executing SQL Schema Migration (001_initial_schema.sql)...');
      await client.query(schemaSql);
      console.log('✅ PostgreSQL Tables successfully migrated: users, businesses, branches, reviews, feedback, plans, advertisements, subscriptions, api_key_configs, system_settings.');

      // 2. Run Seed Data SQL
      const seedPath = path.join(process.cwd(), 'migrations', '002_seed_data.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('🌱 Executing Dummy Seed Data (002_seed_data.sql)...');
      await client.query(seedSql);
      console.log('✅ PostgreSQL Seed Data inserted successfully (Smile Dental Clinic, Bright Coaching, Green Mart, Plans, Ads, Configs).');

      // 3. Run Token Usage & AI Models Migration SQL
      const tokenSchemaPath = path.join(process.cwd(), 'migrations', '003_token_usage_schema.sql');
      const tokenSchemaSql = fs.readFileSync(tokenSchemaPath, 'utf8');
      console.log('⚙️ Executing Token Usage & AI Models Migration (003_token_usage_schema.sql)...');
      await client.query(tokenSchemaSql);
      console.log('✅ Token Usage & AI Models tables successfully created and seeded.');

      // 4. Run Agency Business Migration SQL
      const agencySchemaPath = path.join(process.cwd(), 'migrations', '004_agency_business_and_logo.sql');
      if (fs.existsSync(agencySchemaPath)) {
        const agencySchemaSql = fs.readFileSync(agencySchemaPath, 'utf8');
        console.log('⚙️ Executing Agency Business Migration (004_agency_business_and_logo.sql)...');
        await client.query(agencySchemaSql);
        console.log('✅ Agency Business and Branch created and seeded.');
      }

      // 5. Run QR Scan Tracks Migration SQL
      const qrTrackSchemaPath = path.join(process.cwd(), 'migrations', '005_qr_scan_tracks.sql');
      if (fs.existsSync(qrTrackSchemaPath)) {
        const qrTrackSql = fs.readFileSync(qrTrackSchemaPath, 'utf8');
        console.log('⚙️ Executing QR Scan Tracks Migration (005_qr_scan_tracks.sql)...');
        await client.query(qrTrackSql);
        console.log('✅ QR Scan Tracks table created successfully.');
      }

      // 6. Run Password Migration SQL
      const pwdSchemaPath = path.join(process.cwd(), 'migrations', '006_user_passwords.sql');
      if (fs.existsSync(pwdSchemaPath)) {
        const pwdSql = fs.readFileSync(pwdSchemaPath, 'utf8');
        console.log('⚙️ Executing User Passwords Migration (006_user_passwords.sql)...');
        await client.query(pwdSql);
        console.log('✅ User passwords column added and updated successfully.');
      }

      // 7. Run Password Reset Tokens Migration SQL
      const pwdResetSchemaPath = path.join(process.cwd(), 'migrations', '007_password_resets.sql');
      if (fs.existsSync(pwdResetSchemaPath)) {
        const pwdResetSql = fs.readFileSync(pwdResetSchemaPath, 'utf8');
        console.log('⚙️ Executing Password Reset Tokens Migration (007_password_resets.sql)...');
        await client.query(pwdResetSql);
        console.log('✅ Password Reset Tokens columns added successfully.');
      }

      // 8. Run Super Admin Seed SQL
      const superAdminSeedPath = path.join(process.cwd(), 'migrations', '008_super_admin_seed.sql');
      if (fs.existsSync(superAdminSeedPath)) {
        const superAdminSql = fs.readFileSync(superAdminSeedPath, 'utf8');
        console.log('⚙️ Executing Super Admin Seed (008_super_admin_seed.sql)...');
        await client.query(superAdminSql);
        console.log('✅ Super Admin seed inserted successfully.');
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
