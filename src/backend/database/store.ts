import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  User, Business, Branch, Review, Feedback, Plan, Subscription, Advertisement, ApiKeyConfig, SystemSettings, TokenUsage, AiModel
} from '../../types';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL environment variable is not defined. PostgreSQL store will fallback to in-memory/disabled mode.');
}

const isLocalhost = connectionString ? (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) : true;

export const pool = new pg.Pool({
  connectionString: connectionString || undefined,
  ssl: isLocalhost ? undefined : (process.env.PGSSL === 'false' ? undefined : { rejectUnauthorized: true }),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Row Mapper Helpers
function safeInt(val: any, fallback = 0): number {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function safeFloat(val: any, fallback = 0): number {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
}

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    businessId: row.business_id || undefined,
    avatarUrl: row.avatar_url || undefined,
    password: row.password || undefined,
    status: row.status || 'ACTIVE',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

function mapBusiness(row: any): Business {
  const monthlyTokenLimit = safeInt(row.monthly_token_limit || row.monthly_tokens, 50000);
  const tokensUsedThisMonth = safeInt(row.monthly_tokens_used ?? row.tokens_used_this_month, 0);
  const remainingTokens = row.remaining_tokens !== undefined && row.remaining_tokens !== null
    ? safeInt(row.remaining_tokens, 0)
    : Math.max(0, monthlyTokenLimit - tokensUsedThisMonth);

  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    logoUrl: row.logo_url || undefined,
    category: row.category,
    planId: row.plan_id,
    planName: row.plan_name,
    branchLimit: parseInt(row.branch_limit || 5),
    monthlyTokenLimit,
    tokensUsedThisMonth,
    remainingTokens,
    lastTokenResetAt: row.last_token_reset_at ? new Date(row.last_token_reset_at).toISOString() : undefined,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapTokenUsage(row: any): TokenUsage {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id || undefined,
    reviewId: row.review_id || undefined,
    provider: row.provider || 'Google',
    model: row.model || 'gemini-1.5-flash',
    promptTokens: parseInt(row.prompt_tokens || 0),
    completionTokens: parseInt(row.completion_tokens || 0),
    totalTokens: parseInt(row.total_tokens || 0),
    estimatedCost: parseFloat(row.estimated_cost || 0),
    requestStatus: row.request_status || 'SUCCESS',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

function mapAiModel(row: any): AiModel {
  return {
    id: row.id,
    provider: row.provider || 'Google',
    model: row.model,
    inputCostPer1m: parseFloat(row.input_cost_per_1m || 0.075),
    outputCostPer1m: parseFloat(row.output_cost_per_1m || 0.3),
    active: row.active ?? true,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapBranch(row: any): Branch {
  let tags: string[] = [];
  if (Array.isArray(row.service_tags)) {
    tags = row.service_tags;
  } else if (typeof row.service_tags === 'string') {
    try { tags = JSON.parse(row.service_tags); } catch (e) { tags = []; }
  }

  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    phone: row.phone,
    googlePlaceId: row.google_place_id || undefined,
    googleReviewUrl: row.google_review_url,
    qrCodeUrl: row.qr_code_url || undefined,
    serviceTags: tags,
    totalReviews: parseInt(row.total_reviews || 0),
    avgRating: parseFloat(row.avg_rating || 5.0),
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapReview(row: any): Review {
  let tags: string[] = [];
  if (Array.isArray(row.service_tags)) {
    tags = row.service_tags;
  } else if (typeof row.service_tags === 'string') {
    try { tags = JSON.parse(row.service_tags); } catch (e) { tags = []; }
  }

  return {
    id: row.id,
    branchId: row.branch_id,
    branchName: row.branch_name,
    businessId: row.business_id,
    rating: parseInt(row.rating),
    serviceTags: tags,
    reviewText: row.review_text,
    customerName: row.customer_name || undefined,
    customerEmail: row.customer_email || undefined,
    aiGenerated: row.ai_generated ?? true,
    postedToGoogle: row.posted_to_google ?? false,
    copiedToClipboard: row.copied_to_clipboard ?? false,
    tokensUsed: parseInt(row.tokens_used || 280),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapFeedback(row: any): Feedback {
  return {
    id: row.id,
    branchId: row.branch_id,
    branchName: row.branch_name,
    businessId: row.business_id,
    rating: parseInt(row.rating),
    category: row.category,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone || undefined,
    comments: row.comments,
    status: row.status,
    ownerNotes: row.owner_notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapPlan(row: any): Plan {
  let features: string[] = [];
  if (Array.isArray(row.features)) {
    features = row.features;
  } else if (typeof row.features === 'string') {
    try { features = JSON.parse(row.features); } catch (e) { features = []; }
  }

  return {
    id: row.id,
    name: row.name,
    priceMonthly: parseFloat(row.price_monthly || 0),
    priceYearly: parseFloat(row.price_yearly || 0),
    maxBranches: parseInt(row.max_branches || 1),
    monthlyTokens: parseInt(row.monthly_tokens || 10000),
    features,
    isPopular: row.is_popular ?? false,
    status: row.status,
  };
}

function mapAd(row: any): Advertisement {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    bannerBgColor: row.banner_bg_color || 'bg-slate-900 border border-slate-800',
    bannerTextColor: row.banner_text_color || 'text-white',
    ctaText: row.cta_text || 'Learn More',
    ctaLink: row.cta_link || '#',
    targetPlanId: row.target_plan_id || undefined,
    status: row.status,
    impressions: parseInt(row.impressions || 0),
    clicks: parseInt(row.clicks || 0),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapSubscription(row: any): Subscription {
  return {
    id: row.id,
    businessId: row.business_id,
    planId: row.plan_id,
    planName: row.plan_name || 'Standard Plan',
    billingCycle: row.billing_cycle || 'MONTHLY',
    amount: parseFloat(row.amount || 0),
    status: row.status || 'ACTIVE',
    startedAt: row.started_at || row.start_date ? new Date(row.started_at || row.start_date).toISOString() : new Date().toISOString(),
    expiresAt: row.expires_at || row.end_date ? new Date(row.expires_at || row.end_date).toISOString() : undefined,
    nextBillingDate: row.next_billing_date ? new Date(row.next_billing_date).toISOString() : new Date().toISOString(),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

class DatabaseStore {
  private async query(text: string, params?: any[]) {
    try {
      return await pool.query(text, params);
    } catch (err: any) {
      console.error('PostgreSQL Database Query Error:', err.message);
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message.includes('connect')) {
        throw new Error('Database is not connected');
      }
      throw err;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const res = await pool.query('SELECT 1');
      return res.rowCount !== null && res.rowCount > 0;
    } catch (err) {
      return false;
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    const res = await this.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows.map(mapUser);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const res = await this.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return undefined;
    return mapUser(res.rows[0]);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const res = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] ? mapUser(res.rows[0]) : undefined;
  }

  // ==========================================
  // PASSWORD RESET METHODS
  // ==========================================
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async savePasswordResetToken(email: string, token: string, expiresAt: Date): Promise<boolean> {
    try {
      const hashed = this.hashToken(token);
      const res = await this.query(
        'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE email = $3',
        [hashed, expiresAt.toISOString(), email]
      );
      return (res.rowCount ?? 0) > 0;
    } catch (e) {
      console.error('Failed to save reset token:', e);
      return false;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const hashed = this.hashToken(token);
      const res = await this.query(
        'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires_at > CURRENT_TIMESTAMP',
        [hashed]
      );
      if (res.rows.length === 0) return undefined;
      return mapUser(res.rows[0]);
    } catch (e) {
      console.error('Failed to get user by reset token:', e);
      return undefined;
    }
  }

  async clearPasswordResetToken(userId: string): Promise<boolean> {
    try {
      await this.query(
        'UPDATE users SET reset_token = NULL, reset_token_expires_at = NULL WHERE id = $1',
        [userId]
      );
      return true;
    } catch (e) {
      console.error('Failed to clear reset token:', e);
      return false;
    }
  }

  // ==========================================
  // PLAN STORE METHODS
  async authenticateUser(loginId: string, plainPassword?: string): Promise<{ user?: User; errorReason?: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'INACTIVE' }> {
    const cleanId = loginId.trim().toLowerCase();
    const res = await this.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(id) = LOWER($1)',
      [cleanId]
    );
    if (!res.rows[0]) {
      return { errorReason: 'NOT_FOUND' };
    }
    const userRow = res.rows[0];
    const user = mapUser(userRow);

    if (user.status === 'INACTIVE') {
      return { errorReason: 'INACTIVE' };
    }

    if (plainPassword !== undefined) {
      const storedPassword = userRow.password || '';
      let isValid = false;

      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
        try {
          isValid = bcrypt.compareSync(plainPassword.trim(), storedPassword);
        } catch (err) {
          isValid = false;
        }
      } else if (storedPassword) {
        // Direct string check for legacy hashed fallback
        isValid = storedPassword === plainPassword.trim();
      }

      if (!isValid) {
        return { errorReason: 'INVALID_PASSWORD' };
      }
    }

    return { user };
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = `usr-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const rawPwd = userData.password || 'password123';
    const hashedPassword = rawPwd.startsWith('$2a$') || rawPwd.startsWith('$2b$') ? rawPwd : bcrypt.hashSync(rawPwd, 10);
    const status = userData.status || 'ACTIVE';

    await this.query(
      `INSERT INTO users (id, email, name, role, business_id, avatar_url, password, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, userData.email.trim().toLowerCase(), userData.name, userData.role || 'BUSINESS_OWNER', userData.businessId || null, userData.avatarUrl || null, hashedPassword, status, createdAt]
    );

    return {
      id,
      email: userData.email.trim().toLowerCase(),
      name: userData.name,
      role: userData.role || 'BUSINESS_OWNER',
      businessId: userData.businessId,
      avatarUrl: userData.avatarUrl,
      status,
      createdAt,
    };
  }

  async updateUserPassword(userIdOrEmail: string, newPassword: string): Promise<boolean> {
    const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
    const identifier = userIdOrEmail.trim();
    const isEmail = identifier.includes('@');
    const res = isEmail
      ? await this.query(`UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2)`, [hashedPassword, identifier])
      : await this.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, identifier]);
    return (res.rowCount || 0) > 0;
  }

  // Businesses
  async getBusinesses(ownerId?: string): Promise<Business[]> {
    let queryText = 'SELECT * FROM businesses';
    const params: any[] = [];
    if (ownerId) {
      queryText += ' WHERE owner_id = $1 OR owner_email = (SELECT email FROM users WHERE id = $1) OR id = (SELECT business_id FROM users WHERE id = $1)';
      params.push(ownerId);
    }
    queryText += ' ORDER BY created_at DESC';
    const res = await this.query(queryText, params);
    return res.rows.map(mapBusiness);
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    const res = await this.query('SELECT * FROM businesses WHERE id = $1', [id]);
    return res.rows[0] ? mapBusiness(res.rows[0]) : undefined;
  }

  async getBusinessByOwnerId(ownerId: string): Promise<Business | undefined> {
    const res = await this.query(
      'SELECT * FROM businesses WHERE owner_id = $1 OR owner_email = (SELECT email FROM users WHERE id = $1) OR id = (SELECT business_id FROM users WHERE id = $1)',
      [ownerId]
    );
    return res.rows[0] ? mapBusiness(res.rows[0]) : undefined;
  }

  async createBusinessWithAccount(params: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    password: string;
    category?: string;
    planId?: string;
    logoUrl?: string;
    branchLimit?: number;
    monthlyTokenLimit?: number;
  }): Promise<{ business: Business; user: User }> {
    const cleanEmail = params.ownerEmail.trim().toLowerCase();
    const hashedPassword = bcrypt.hashSync(params.password, 10);
    const userId = `usr-${crypto.randomUUID().slice(0, 12)}`;
    const bizId = `biz-${crypto.randomUUID().slice(0, 12)}`;
    const createdAt = new Date().toISOString();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Create User account with BUSINESS_OWNER role
      await client.query(
        `INSERT INTO users (id, email, name, role, business_id, avatar_url, password, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, cleanEmail, params.ownerName, 'BUSINESS_OWNER', bizId, null, hashedPassword, 'ACTIVE', createdAt]
      );

      // 2. Create Business record
      const newBiz: Business = {
        id: bizId,
        name: params.name,
        ownerId: userId,
        ownerName: params.ownerName,
        ownerEmail: cleanEmail,
        logoUrl: params.logoUrl || undefined,
        category: params.category || 'General Service',
        planId: params.planId || 'plan-pro',
        planName: params.planId === 'plan-enterprise' ? 'Enterprise Plan' : 'Professional Plan',
        branchLimit: params.branchLimit || 5,
        monthlyTokenLimit: params.monthlyTokenLimit || 50000,
        tokensUsedThisMonth: 0,
        status: 'ACTIVE',
        createdAt,
      };

      await client.query(
        `INSERT INTO businesses (
          id, name, owner_id, owner_name, owner_email, logo_url, category,
          plan_id, plan_name, branch_limit, monthly_token_limit, tokens_used_this_month, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          newBiz.id, newBiz.name, newBiz.ownerId, newBiz.ownerName, newBiz.ownerEmail, newBiz.logoUrl || null,
          newBiz.category, newBiz.planId, newBiz.planName, newBiz.branchLimit, newBiz.monthlyTokenLimit,
          newBiz.tokensUsedThisMonth, newBiz.status, newBiz.createdAt
        ]
      );

      // 3. Create initial main branch
      const branchId = `branch-${bizId}-main`;
      await client.query(
        `INSERT INTO branches (
          id, business_id, name, address, city, state, zip_code, phone,
          google_place_id, google_review_url, service_tags, total_reviews, avg_rating, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          branchId,
          bizId,
          `${params.name} - Main Branch`,
          '',
          '',
          '',
          '',
          '',
          null,
          'https://search.google.com/local/writereview',
          JSON.stringify(['Friendly Staff', 'Clean Environment', 'Fast Service']),
          0,
          5.0,
          'ACTIVE',
          createdAt
        ]
      );

      await client.query('COMMIT');

      const createdUser: User = {
        id: userId,
        email: cleanEmail,
        name: params.ownerName,
        role: 'BUSINESS_OWNER',
        businessId: bizId,
        status: 'ACTIVE',
        createdAt,
      };

      return { business: newBiz, user: createdUser };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async createBusiness(bizData: Partial<Business>): Promise<Business> {
    const id = `biz-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newBiz: Business = {
      id,
      name: bizData.name || 'New Business',
      ownerId: bizData.ownerId || `usr-${Date.now()}`,
      ownerName: bizData.ownerName || 'Business Owner',
      ownerEmail: bizData.ownerEmail || 'owner@example.com',
      logoUrl: bizData.logoUrl || undefined,
      category: bizData.category || 'General Service',
      planId: bizData.planId || 'plan-pro',
      planName: bizData.planName || 'Professional Plan',
      branchLimit: bizData.branchLimit || 5,
      monthlyTokenLimit: bizData.monthlyTokenLimit || 50000,
      tokensUsedThisMonth: 0,
      status: 'ACTIVE',
      createdAt,
    };

    await this.query(
      `INSERT INTO businesses (
        id, name, owner_id, owner_name, owner_email, logo_url, category,
        plan_id, plan_name, branch_limit, monthly_token_limit, tokens_used_this_month, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        newBiz.id, newBiz.name, newBiz.ownerId, newBiz.ownerName, newBiz.ownerEmail, newBiz.logoUrl || null,
        newBiz.category, newBiz.planId, newBiz.planName, newBiz.branchLimit, newBiz.monthlyTokenLimit,
        newBiz.tokensUsedThisMonth, newBiz.status, newBiz.createdAt
      ]
    );

    const existingUser = await this.getUserByEmail(newBiz.ownerEmail);
    if (!existingUser) {
      await this.createUser({
        email: newBiz.ownerEmail,
        name: newBiz.ownerName,
        role: 'BUSINESS_OWNER',
        businessId: newBiz.id,
      });
    }

    return newBiz;
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
    const current = await this.getBusinessById(id);
    if (!current) return null;

    const updated = { ...current, ...updates };
    await this.query(
      `UPDATE businesses SET
        name = $1, owner_name = $2, owner_email = $3, logo_url = $4, category = $5,
        plan_id = $6, plan_name = $7, branch_limit = $8, monthly_token_limit = $9,
        tokens_used_this_month = $10, status = $11
      WHERE id = $12`,
      [
        updated.name, updated.ownerName, updated.ownerEmail, updated.logoUrl || null,
        updated.category, updated.planId, updated.planName, updated.branchLimit,
        updated.monthlyTokenLimit, updated.tokensUsedThisMonth, updated.status, id
      ]
    );
    return updated;
  }

  async deleteBusiness(id: string): Promise<boolean> {
    await this.query('DELETE FROM users WHERE business_id = $1', [id]);
    const res = await this.query('DELETE FROM businesses WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }

  async getSubscriptionByBusinessId(businessId: string): Promise<Subscription | null> {
    try {
      const res = await this.query('SELECT * FROM subscriptions WHERE business_id = $1 ORDER BY created_at DESC LIMIT 1', [businessId]);
      if (res.rows[0]) {
        return mapSubscription(res.rows[0]);
      }
    } catch (e) {
      console.warn('getSubscriptionByBusinessId query error:', e);
    }
    return null;
  }

  // Branches
  async getBranches(businessId?: string): Promise<Branch[]> {
    let queryText = 'SELECT * FROM branches';
    const params: any[] = [];
    if (businessId) {
      queryText += ' WHERE business_id = $1';
      params.push(businessId);
    }
    queryText += ' ORDER BY created_at DESC';
    const res = await this.query(queryText, params);
    return res.rows.map(mapBranch);
  }

  async getBranchById(id: string): Promise<Branch | undefined> {
    const res = await this.query('SELECT * FROM branches WHERE id = $1', [id]);
    return res.rows[0] ? mapBranch(res.rows[0]) : undefined;
  }

  async createBranch(branchData: Omit<Branch, 'id' | 'createdAt' | 'totalReviews' | 'avgRating'>): Promise<Branch> {
    const biz = await this.getBusinessById(branchData.businessId);
    if (biz) {
      const existingBranches = await this.getBranches(biz.id);
      if (existingBranches.length >= biz.branchLimit) {
        throw new Error(`Branch limit reached! Your plan allows up to ${biz.branchLimit} branches.`);
      }
    }

    const id = `branch-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newBranch: Branch = {
      ...branchData,
      id,
      totalReviews: 0,
      avgRating: 5.0,
      createdAt,
    };

    await this.query(
      `INSERT INTO branches (
        id, business_id, name, address, city, state, zip_code, phone,
        google_place_id, google_review_url, qr_code_url, service_tags,
        total_reviews, avg_rating, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        newBranch.id,
        newBranch.businessId,
        newBranch.name,
        newBranch.address || '123 Main Street',
        newBranch.city || 'San Francisco',
        newBranch.state || 'CA',
        newBranch.zipCode || '94103',
        newBranch.phone || '+1 800-555-0199',
        newBranch.googlePlaceId || null,
        newBranch.googleReviewUrl || 'https://search.google.com/local/writereview',
        newBranch.qrCodeUrl || null,
        JSON.stringify(newBranch.serviceTags || ['Friendly Staff', 'Clean Environment']),
        newBranch.totalReviews || 0,
        newBranch.avgRating || 5.0,
        newBranch.status || 'ACTIVE',
        newBranch.createdAt
      ]
    );

    return newBranch;
  }

  async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
    const current = await this.getBranchById(id);
    if (!current) return null;

    const updated = { ...current, ...updates };
    await this.query(
      `UPDATE branches SET
        name = $1, address = $2, city = $3, state = $4, zip_code = $5, phone = $6,
        google_place_id = $7, google_review_url = $8, qr_code_url = $9, service_tags = $10,
        total_reviews = $11, avg_rating = $12, status = $13
      WHERE id = $14`,
      [
        updated.name,
        updated.address || '123 Main Street',
        updated.city || 'San Francisco',
        updated.state || 'CA',
        updated.zipCode || '94103',
        updated.phone || '+1 800-555-0199',
        updated.googlePlaceId || null,
        updated.googleReviewUrl || 'https://search.google.com/local/writereview',
        updated.qrCodeUrl || null,
        JSON.stringify(updated.serviceTags || []),
        updated.totalReviews || 0,
        updated.avgRating || 5.0,
        updated.status || 'ACTIVE',
        id
      ]
    );
    return updated;
  }

  async deleteBranch(id: string): Promise<boolean> {
    const res = await this.query('DELETE FROM branches WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }

  // Reviews
  async getReviews(businessId?: string, branchId?: string): Promise<Review[]> {
    let queryText = 'SELECT * FROM reviews';
    const conditions: string[] = [];
    const params: any[] = [];

    if (businessId) {
      params.push(businessId);
      conditions.push(`business_id = $${params.length}`);
    }
    if (branchId) {
      params.push(branchId);
      conditions.push(`branch_id = $${params.length}`);
    }
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    queryText += ' ORDER BY created_at DESC';

    const res = await this.query(queryText, params);
    return res.rows.map(mapReview);
  }

  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const id = `rev-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newReview: Review = {
      ...reviewData,
      id,
      createdAt,
    };

    await this.query(
      `INSERT INTO reviews (
        id, branch_id, branch_name, business_id, rating, service_tags, review_text,
        customer_name, customer_email, ai_generated, posted_to_google, copied_to_clipboard, tokens_used, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        newReview.id, newReview.branchId, newReview.branchName, newReview.businessId,
        newReview.rating, JSON.stringify(newReview.serviceTags || []), newReview.reviewText,
        newReview.customerName || null, newReview.customerEmail || null, newReview.aiGenerated ?? true,
        newReview.postedToGoogle ?? false, newReview.copiedToClipboard ?? false, newReview.tokensUsed || 280, newReview.createdAt
      ]
    );

    try {
      await this.query(`
        UPDATE branches SET
          total_reviews = (SELECT COUNT(*) FROM reviews WHERE branch_id = $1),
          avg_rating    = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE branch_id = $1), 5.00)
        WHERE id = $1
      `, [reviewData.branchId]);
    } catch (e) {
      console.warn('Failed to update branch rating summary:', e);
    }

    return newReview;
  }

  // Feedback
  async getFeedback(businessId?: string, branchId?: string): Promise<Feedback[]> {
    let queryText = 'SELECT * FROM feedback';
    const conditions: string[] = [];
    const params: any[] = [];

    if (businessId) {
      params.push(businessId);
      conditions.push(`business_id = $${params.length}`);
    }
    if (branchId) {
      params.push(branchId);
      conditions.push(`branch_id = $${params.length}`);
    }
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    queryText += ' ORDER BY created_at DESC';

    const res = await this.query(queryText, params);
    return res.rows.map(mapFeedback);
  }

  async getFeedbackById(id: string): Promise<Feedback | undefined> {
    const res = await this.query('SELECT * FROM feedback WHERE id = $1', [id]);
    return res.rows[0] ? mapFeedback(res.rows[0]) : undefined;
  }

  async addFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Promise<Feedback> {
    const id = `fb-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newFb: Feedback = {
      ...feedbackData,
      id,
      status: 'NEW',
      createdAt,
    };

    await this.query(
      `INSERT INTO feedback (
        id, branch_id, branch_name, business_id, rating, category, customer_name, customer_email, customer_phone, comments, status, owner_notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        newFb.id, newFb.branchId, newFb.branchName, newFb.businessId, newFb.rating,
        newFb.category, newFb.customerName, newFb.customerEmail, newFb.customerPhone || null,
        newFb.comments, newFb.status, newFb.ownerNotes || null, newFb.createdAt
      ]
    );

    return newFb;
  }

  async updateFeedback(id: string, updates: Partial<Feedback>): Promise<Feedback | null> {
    const res = await this.query('SELECT * FROM feedback WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const current = mapFeedback(res.rows[0]);
    const updated = { ...current, ...updates };

    await this.query(
      `UPDATE feedback SET
        status = $1, owner_notes = $2
      WHERE id = $3`,
      [updated.status, updated.ownerNotes || null, id]
    );
    return updated;
  }

  // SaaS Plans
  async getPlans(): Promise<Plan[]> {
    const res = await this.query('SELECT * FROM plans ORDER BY price_monthly ASC');
    return res.rows.map(mapPlan);
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    const res = await this.query('SELECT * FROM plans WHERE id = $1', [id]);
    return res.rows[0] ? mapPlan(res.rows[0]) : undefined;
  }

  async createPlan(planData: Omit<Plan, 'id'>): Promise<Plan> {
    const id = `plan-${Date.now()}`;
    const newPlan: Plan = { ...planData, id };

    await this.query(
      `INSERT INTO plans (
        id, name, price_monthly, price_yearly, max_branches, monthly_tokens, features, is_popular, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newPlan.id, newPlan.name, newPlan.priceMonthly, newPlan.priceYearly,
        newPlan.maxBranches, newPlan.monthlyTokens, JSON.stringify(newPlan.features || []),
        newPlan.isPopular || false, newPlan.status || 'ACTIVE'
      ]
    );

    return newPlan;
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | null> {
    const plan = await this.getPlanById(id);
    if (!plan) return null;
    const updated = { ...plan, ...updates };

    await this.query(
      `UPDATE plans SET
        name = $1, price_monthly = $2, price_yearly = $3, max_branches = $4,
        monthly_tokens = $5, features = $6, is_popular = $7, status = $8
      WHERE id = $9`,
      [
        updated.name, updated.priceMonthly, updated.priceYearly, updated.maxBranches,
        updated.monthlyTokens, JSON.stringify(updated.features || []), updated.isPopular, updated.status, id
      ]
    );

    return updated;
  }

  async deletePlan(id: string): Promise<boolean> {
    const res = await this.query('DELETE FROM plans WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
  async getAds(): Promise<Advertisement[]> {
    const res = await this.query("SELECT * FROM advertisements WHERE status = 'ACTIVE' ORDER BY created_at DESC");
    return res.rows.map(mapAd);
  }

  async getAllAds(): Promise<Advertisement[]> {
    const res = await this.query('SELECT * FROM advertisements ORDER BY created_at DESC');
    return res.rows.map(mapAd);
  }

  async createAd(adData: Omit<Advertisement, 'id' | 'createdAt' | 'impressions' | 'clicks'>): Promise<Advertisement> {
    const id = `ad-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newAd: Advertisement = {
      ...adData,
      id,
      impressions: 0,
      clicks: 0,
      createdAt,
    };

    await this.query(
      `INSERT INTO advertisements (
        id, title, description, banner_bg_color, banner_text_color, cta_text, cta_link, target_plan_id, status, impressions, clicks, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        newAd.id, newAd.title, newAd.description, newAd.bannerBgColor, newAd.bannerTextColor,
        newAd.ctaText, newAd.ctaLink, newAd.targetPlanId || null, newAd.status || 'ACTIVE',
        newAd.impressions, newAd.clicks, newAd.createdAt
      ]
    );

    return newAd;
  }

  async updateAd(id: string, updates: Partial<Advertisement>): Promise<Advertisement | null> {
    const res = await this.query('SELECT * FROM advertisements WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const current = mapAd(res.rows[0]);
    const updated = { ...current, ...updates };

    await this.query(
      `UPDATE advertisements SET
        title = $1, description = $2, banner_bg_color = $3, banner_text_color = $4,
        cta_text = $5, cta_link = $6, target_plan_id = $7, status = $8,
        impressions = $9, clicks = $10
      WHERE id = $11`,
      [
        updated.title, updated.description, updated.bannerBgColor, updated.bannerTextColor,
        updated.ctaText, updated.ctaLink, updated.targetPlanId || null, updated.status,
        updated.impressions, updated.clicks, id
      ]
    );

    return updated;
  }

  async deleteAd(id: string): Promise<boolean> {
    const res = await this.query('DELETE FROM advertisements WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }

  // System Settings & API Config
  async getApiKeyConfig(): Promise<ApiKeyConfig> {
    const res = await this.query('SELECT * FROM api_key_configs WHERE id = 1');
    if (res.rows.length === 0) {
      return {
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        primaryModel: 'gemini-1.5-flash',
        promptTemplate: 'Write a high converting, realistic 5-star customer review.',
        temperature: 0.7,
        isCustomKeyActive: true,
        updatedAt: new Date().toISOString(),
      };
    }
    const r = res.rows[0];
    return {
      geminiApiKey: r.gemini_api_key || '',
      openaiApiKey: r.openai_api_key || undefined,
      primaryModel: r.primary_model || 'gemini-1.5-flash',
      promptTemplate: r.prompt_template || '',
      temperature: parseFloat(r.temperature || 0.7),
      isCustomKeyActive: r.is_custom_key_active ?? true,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    };
  }

  async updateApiKeyConfig(config: Partial<ApiKeyConfig>): Promise<ApiKeyConfig> {
    const current = await this.getApiKeyConfig();
    const updated = { ...current, ...config, updatedAt: new Date().toISOString() };

    await this.query(
      `INSERT INTO api_key_configs (id, gemini_api_key, openai_api_key, primary_model, prompt_template, temperature, is_custom_key_active, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
        gemini_api_key = EXCLUDED.gemini_api_key,
        openai_api_key = EXCLUDED.openai_api_key,
        primary_model = EXCLUDED.primary_model,
        prompt_template = EXCLUDED.prompt_template,
        temperature = EXCLUDED.temperature,
        is_custom_key_active = EXCLUDED.is_custom_key_active,
        updated_at = EXCLUDED.updated_at`,
      [
        updated.geminiApiKey, updated.openaiApiKey || null, updated.primaryModel,
        updated.promptTemplate, updated.temperature, updated.isCustomKeyActive, updated.updatedAt
      ]
    );

    return updated;
  }

  async getSettings(): Promise<SystemSettings> {
    const res = await this.query('SELECT * FROM system_settings WHERE id = 1');
    if (res.rows.length === 0) {
      return {
        agencyName: 'ReviewScore AI Agency Studio',
        supportEmail: 'support@reviewscore.ai',
        googleRedirectDelayMs: 1500,
        minStarForGoogle: 4,
        defaultPrompt: 'Generates authentic local business review based on customer feedback.',
      };
    }
    const r = res.rows[0];
    return {
      agencyName: r.agency_name,
      supportEmail: r.support_email,
      googleRedirectDelayMs: parseInt(r.google_redirect_delay_ms || 1500),
      minStarForGoogle: parseInt(r.min_star_for_google || 4),
      defaultPrompt: r.default_prompt,
    };
  }

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };

    await this.query(
      `INSERT INTO system_settings (id, agency_name, support_email, google_redirect_delay_ms, min_star_for_google, default_prompt, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
        agency_name = EXCLUDED.agency_name,
        support_email = EXCLUDED.support_email,
        google_redirect_delay_ms = EXCLUDED.google_redirect_delay_ms,
        min_star_for_google = EXCLUDED.min_star_for_google,
        default_prompt = EXCLUDED.default_prompt,
        updated_at = CURRENT_TIMESTAMP`,
      [
        updated.agencyName, updated.supportEmail, updated.googleRedirectDelayMs,
        updated.minStarForGoogle, updated.defaultPrompt
      ]
    );

    return updated;
  }

  // Analytics Stats
  async getAgencyStats() {
    try {
      const res = await this.query(`
        SELECT
          (SELECT COUNT(*) FROM businesses)                                         AS total_businesses,
          (SELECT COUNT(*) FROM branches)                                           AS total_branches,
          (SELECT COUNT(*) FROM reviews)                                            AS total_reviews,
          (SELECT COUNT(*) FROM feedback)                                           AS total_feedback,
          (SELECT COALESCE(SUM(tokens_used_this_month), 0) FROM businesses)         AS total_tokens_used,
          (SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE')              AS active_subscriptions,
          (SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'ACTIVE') AS monthly_revenue
      `);
      const row = res.rows[0];

      return {
        totalBusinesses: parseInt(row.total_businesses || 0, 10),
        totalBranches: parseInt(row.total_branches || 0, 10),
        totalReviews: parseInt(row.total_reviews || 0, 10),
        totalFeedback: parseInt(row.total_feedback || 0, 10),
        totalTokensUsed: parseInt(row.total_tokens_used || 0, 10),
        activeSubscriptions: parseInt(row.active_subscriptions || 0, 10),
        monthlyRevenue: parseFloat(row.monthly_revenue || 0),
      };
    } catch (e) {
      return {
        totalBusinesses: 0,
        totalBranches: 0,
        totalReviews: 0,
        totalFeedback: 0,
        totalTokensUsed: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
      };
    }
  }

  async getBusinessOwnerStats(businessId: string) {
    const biz = await this.getBusinessById(businessId);
    const branches = await this.getBranches(businessId);
    const reviews = await this.getReviews(businessId);
    const feedback = await this.getFeedback(businessId);

    const totalReviews = reviews.length;
    const totalFeedback = feedback.length;
    const avgRating = reviews.length > 0
      ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 5.0;

    const positiveReviews = reviews.filter(r => r.rating >= 4).length;
    const positivePercentage = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 100;
    const postedToGoogleCount = reviews.filter(r => r.postedToGoogle).length;

    return {
      business: biz,
      totalBranches: branches.length,
      branchLimit: biz?.branchLimit || 5,
      totalReviews,
      avgRating,
      positivePercentage,
      totalFeedback,
      postedToGoogleCount,
      tokensUsed: biz?.tokensUsedThisMonth || 0,
      monthlyTokenLimit: biz?.monthlyTokenLimit || 50000,
      remainingTokens: biz?.remainingTokens ?? Math.max(0, (biz?.monthlyTokenLimit || 50000) - (biz?.tokensUsedThisMonth || 0)),
    };
  }

  // ==========================================
  // AI MODELS PRICING STORE METHODS
  // ==========================================
  async getAiModels(): Promise<AiModel[]> {
    try {
      const res = await this.query('SELECT * FROM ai_models ORDER BY created_at DESC');
      if (res.rows.length > 0) return res.rows.map(mapAiModel);
    } catch (e) {
      console.warn('ai_models table query fallback:', e);
    }
    // Fallback seed models
    return [
      { id: 'model-gemini-25-flash', provider: 'Google', model: 'gemini-2.5-flash', inputCostPer1m: 0.075, outputCostPer1m: 0.3, active: true },
      { id: 'model-gemini-15-flash', provider: 'Google', model: 'gemini-1.5-flash', inputCostPer1m: 0.075, outputCostPer1m: 0.3, active: true },
      { id: 'model-gemini-15-pro', provider: 'Google', model: 'gemini-1.5-pro', inputCostPer1m: 1.25, outputCostPer1m: 5.0, active: true },
    ];
  }

  async getAiModelByName(modelName: string): Promise<AiModel | undefined> {
    const models = await this.getAiModels();
    return models.find(m => m.model.toLowerCase() === modelName.toLowerCase()) || models[0];
  }

  // ==========================================
  // TOKEN USAGE ACCOUNTING STORE METHODS
  // ==========================================
  async addTokenUsage(data: Omit<TokenUsage, 'id' | 'createdAt'>): Promise<TokenUsage> {
    const id = `tu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const createdAt = new Date().toISOString();
    const newRecord: TokenUsage = {
      ...data,
      id,
      createdAt,
    };

    try {
      await this.query(
        `INSERT INTO token_usage (
          id, business_id, branch_id, review_id, provider, model,
          prompt_tokens, completion_tokens, total_tokens, estimated_cost, request_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newRecord.id, newRecord.businessId, newRecord.branchId || null, newRecord.reviewId || null,
          newRecord.provider, newRecord.model, newRecord.promptTokens, newRecord.completionTokens,
          newRecord.totalTokens, newRecord.estimatedCost, newRecord.requestStatus, newRecord.createdAt
        ]
      );
    } catch (err) {
      console.warn('Failed to insert token_usage to postgres:', err);
    }

    return newRecord;
  }

  async getTokenUsageList(businessId?: string, branchId?: string): Promise<TokenUsage[]> {
    try {
      let queryText = 'SELECT * FROM token_usage';
      const params: any[] = [];
      const conds: string[] = [];

      if (businessId) {
        params.push(businessId);
        conds.push(`business_id = $${params.length}`);
      }
      if (branchId) {
        params.push(branchId);
        conds.push(`branch_id = $${params.length}`);
      }
      if (conds.length > 0) queryText += ' WHERE ' + conds.join(' AND ');
      queryText += ' ORDER BY created_at DESC LIMIT 500';

      const res = await this.query(queryText, params);
      return res.rows.map(mapTokenUsage);
    } catch (e) {
      return [];
    }
  }

  async updateBusinessTokenUsage(businessId: string, tokensUsedInRequest: number): Promise<Business | null> {
    const biz = await this.getBusinessById(businessId);
    if (!biz) return null;

    const newTokensUsed = biz.tokensUsedThisMonth + tokensUsedInRequest;
    const newRemaining = Math.max(0, biz.monthlyTokenLimit - newTokensUsed);

    try {
      await this.query(
        `UPDATE businesses SET
          monthly_tokens_used = $1,
          tokens_used_this_month = $1,
          remaining_tokens = $2
        WHERE id = $3`,
        [newTokensUsed, newRemaining, businessId]
      );
    } catch (e) {
      console.warn('Failed to update business tokens in DB:', e);
    }

    biz.tokensUsedThisMonth = newTokensUsed;
    biz.remainingTokens = newRemaining;
    return biz;
  }

  async resetMonthlyTokensForAll(): Promise<{ updatedCount: number }> {
    try {
      const res = await this.query(
        `UPDATE businesses SET
          monthly_tokens_used = 0,
          tokens_used_this_month = 0,
          remaining_tokens = monthly_token_limit,
          last_token_reset_at = CURRENT_TIMESTAMP`
      );
      return { updatedCount: res.rowCount || 0 };
    } catch (e) {
      return { updatedCount: 0 };
    }
  }

  // ==========================================
  // DEMO MANAGEMENT & QR TRACKING METHODS
  // ==========================================
  async resetDemoData(businessId = 'biz-agency'): Promise<{ success: boolean; message: string }> {
    try {
      await this.query('DELETE FROM reviews WHERE business_id = $1', [businessId]);
      await this.query('DELETE FROM feedback WHERE business_id = $1', [businessId]);

      // Seed 5 initial clean demo reviews
      await this.seedDemoReviews(5, businessId, 'branch-agency-main');
      await this.seedDemoFeedback(2, businessId, 'branch-agency-main');

      return { success: true, message: 'Demo reviews and feedback reset to pristine initial state.' };
    } catch (e: any) {
      return { success: false, message: `Failed to reset demo data: ${e.message}` };
    }
  }

  async seedDemoReviews(count = 5, businessId = 'biz-agency', branchId = 'branch-agency-main'): Promise<Review[]> {
    const created: Review[] = [];
    const sampleNames = ['Alex Morgan', 'Priya Sharma', 'David Kim', 'Sarah Jenkins', 'Carlos Mendez', 'Elena Rostova'];
    const sampleTags = ['Fast Onboarding', 'High Marketing ROI', 'AI Software Setup', 'Smooth Support'];
    const sampleTexts = [
      'ReviewScore AI completely transformed our customer review collection! We got 45 new 5-star Google reviews in the first week.',
      'Extremely impressed with the AI review generator. Our customers love how effortless it is to leave feedback.',
      'The private feedback gatekeeper saved our clinic from a 1-star review when an appointment was delayed. Solved it privately!',
      'Setting up table tent QR codes was super easy. Highest conversion rate of any review tool we have tried.',
      'Fantastic agency white-label platform. Highly recommended for multi-location local businesses!'
    ];

    for (let i = 0; i < count; i++) {
      const review: Omit<Review, 'id' | 'createdAt'> = {
        branchId,
        branchName: 'Agency Headquarters',
        businessId,
        rating: 5,
        serviceTags: [sampleTags[i % sampleTags.length], '5-Star Service'],
        reviewText: sampleTexts[i % sampleTexts.length],
        customerName: sampleNames[i % sampleNames.length],
        aiGenerated: true,
        postedToGoogle: true,
        copiedToClipboard: true,
        tokensUsed: 120 + i * 10
      };
      const saved = await this.addReview(review);
      created.push(saved);
    }
    return created;
  }

  async seedDemoFeedback(count = 2, businessId = 'biz-agency', branchId = 'branch-agency-main'): Promise<Feedback[]> {
    const created: Feedback[] = [];
    const sampleNames = ['Marcus Vance', 'Anita Patel'];
    const sampleComments = [
      'Had a slight delay accessing my custom QR design template, but team resolved it quickly.',
      'Would love an automated SMS follow-up feature in the next platform update!'
    ];

    for (let i = 0; i < count; i++) {
      const fb: Omit<Feedback, 'id' | 'createdAt'> = {
        branchId,
        branchName: 'Agency Headquarters',
        businessId,
        rating: 3,
        category: 'Feature Request',
        customerName: sampleNames[i % sampleNames.length],
        customerEmail: `customer${i}@example.com`,
        comments: sampleComments[i % sampleComments.length],
        status: 'NEW'
      };
      const saved = await this.addFeedback(fb);
      created.push(saved);
    }
    return created;
  }

  async recordQrScanTrack(data: {
    branchId: string;
    businessId: string;
    deviceType?: string;
    browser?: string;
    city?: string;
    country?: string;
    referrer?: string;
  }) {
    const id = `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const createdAt = new Date().toISOString();

    try {
      await this.query(
        `INSERT INTO qr_scan_tracks (id, branch_id, business_id, device_type, browser, city, country, referrer, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          data.branchId,
          data.businessId,
          data.deviceType || 'Mobile',
          data.browser || 'Safari',
          data.city || 'Mumbai',
          data.country || 'India',
          data.referrer || 'QR Standee',
          createdAt
        ]
      );
    } catch (e) {
      console.warn('Failed to store QR scan track event in DB:', e);
    }
    return { id, ...data, createdAt };
  }

  async getQrScanAnalytics(businessId?: string, branchId?: string) {
    try {
      let queryText = 'SELECT * FROM qr_scan_tracks';
      const params: any[] = [];
      const conds: string[] = [];

      if (businessId) {
        params.push(businessId);
        conds.push(`business_id = $${params.length}`);
      }
      if (branchId) {
        params.push(branchId);
        conds.push(`branch_id = $${params.length}`);
      }
      if (conds.length > 0) queryText += ' WHERE ' + conds.join(' AND ');
      queryText += ' ORDER BY created_at DESC LIMIT 1000';

      const res = await this.query(queryText, params);
      const rows = res.rows;

      const totalScans = rows.length;
      const deviceBreakdown = {
        Mobile: rows.filter(r => r.device_type === 'Mobile').length,
        Desktop: rows.filter(r => r.device_type === 'Desktop').length,
        Tablet: rows.filter(r => r.device_type === 'Tablet').length,
      };

      return {
        totalScans,
        deviceBreakdown,
        recentScans: rows.slice(0, 20).map(r => ({
          id: r.id,
          branchId: r.branch_id,
          businessId: r.business_id,
          deviceType: r.device_type,
          browser: r.browser,
          city: r.city,
          country: r.country,
          createdAt: r.created_at,
        }))
      };
    } catch (e) {
      return { totalScans: 0, deviceBreakdown: { Mobile: 0, Desktop: 0, Tablet: 0 }, recentScans: [] };
    }
  }
}


export const db = new DatabaseStore();
