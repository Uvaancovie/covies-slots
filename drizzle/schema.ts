import { pgTable, serial, text, varchar, timestamp, integer, decimal, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';

// Users table - Option B auth (no Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  referralCode: varchar('referral_code', { length: 50 }).notNull().unique(),
  isAdmin: boolean('is_admin').notNull().default(false),
  joinedDate: timestamp('joined_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // ⚡ Performance index
  emailIdx: index('users_email_idx').on(table.email),
}));

// Sessions table - for JWT tracking and revocation
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // ⚡ Performance indexes
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  tokenIdx: index('sessions_token_idx').on(table.token),
}));

// Transactions table - ledger for all balance changes
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // DEPOSIT, WITHDRAWAL, BET, WIN, BONUS_CREDIT, BONUS_FREE_SPIN, ADMIN_ADJUSTMENT
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 15, scale: 2 }).notNull(),
  method: varchar('method', { length: 100 }), // e.g., 'EFT', 'Card', 'Welcome Bonus', 'Daily Spin'
  status: varchar('status', { length: 50 }).notNull().default('COMPLETED'), // PENDING, COMPLETED, FAILED
  metadata: jsonb('metadata'), // flexible field for additional data
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // ⚡ Performance indexes - critical for balance queries
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
  createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  userIdCreatedAtIdx: index('transactions_user_id_created_at_idx').on(table.userId, table.createdAt),
}));

// Game rounds/history table - one row per spin
export const gameRounds = pgTable('game_rounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  betAmount: decimal('bet_amount', { precision: 15, scale: 2 }).notNull(),
  winAmount: decimal('win_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  isFreeSpin: boolean('is_free_spin').notNull().default(false),
  multiplier: decimal('multiplier', { precision: 5, scale: 2 }).notNull().default('1'),
  resultGrid: jsonb('result_grid').notNull(), // stores EvaluationResult
  userBonusClaimId: uuid('user_bonus_claim_id').references(() => userBonusClaims.id), // link to bonus if free spin
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // ⚡ Performance indexes
  userIdIdx: index('game_rounds_user_id_idx').on(table.userId),
  createdAtIdx: index('game_rounds_created_at_idx').on(table.createdAt),
}));

// Bonuses table - configurable bonus definitions
export const bonuses = pgTable('bonuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // WELCOME, DAILY, REFERRAL, DEPOSIT_MATCH, FREE_SPINS
  creditAmount: decimal('credit_amount', { precision: 15, scale: 2 }).default('0'), // cash bonus
  freeSpinsCount: integer('free_spins_count').default(0), // free spins
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  rules: jsonb('rules'), // flexible JSON for eligibility/conditions
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User bonus claims - tracks who claimed what
export const userBonusClaims = pgTable('user_bonus_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bonusId: uuid('bonus_id').notNull().references(() => bonuses.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, COMPLETED, EXPIRED, CANCELLED
  creditedAmount: decimal('credited_amount', { precision: 15, scale: 2 }).default('0'),
  freeSpinsTotal: integer('free_spins_total').default(0),
  freeSpinsRemaining: integer('free_spins_remaining').default(0),
  expiresAt: timestamp('expires_at'),
  claimedAt: timestamp('claimed_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  // ⚡ Performance indexes - critical for active bonus lookup
  userIdIdx: index('user_bonus_claims_user_id_idx').on(table.userId),
  statusIdx: index('user_bonus_claims_status_idx').on(table.status),
  userIdStatusIdx: index('user_bonus_claims_user_id_status_idx').on(table.userId, table.status),
}));
        