# Gemini Slot Machine - Supabase + Drizzle Setup Guide

## ✅ What's Implemented

Your slot machine app now has a complete **Option B auth** (custom JWT) + **Supabase Postgres** + **Drizzle ORM** + **Vercel Functions** backend.

### Database Schema
- `users` - User accounts with email/password auth
- `sessions` - JWT session tracking
- `transactions` - Ledger for all balance changes (deposits, bets, wins, bonuses)
- `game_rounds` - Game history with full spin results
- `bonuses` - Configurable bonus definitions
- `user_bonus_claims` - Tracks bonus claims and free spins

### API Endpoints (Vercel Functions)

**Auth:**
- `POST /api/auth/register` - Create account + welcome bonus
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user + balance

**Account:**
- `GET /api/transactions` - Transaction history
- `POST /api/deposit` - Add funds
- `POST /api/withdraw` - Withdraw funds

**Gameplay:**
- `POST /api/spin` - Play a spin (server-side RNG + balance updates)
- `GET /api/history` - Game history

**Bonuses:**
- `GET /api/bonuses` - List available bonuses
- `POST /api/bonuses/claim` - Claim a bonus

---

## 🚀 Local Development Setup

### 1. Environment Variables

Add to `.env.local`:

\`\`\`env
# Supabase Postgres (get from Supabase Dashboard → Settings → Database)
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres
DATABASE_DIRECT_URL=postgresql://...db.xyz.supabase.co:5432/postgres

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Gemini API Key (optional, for lucky story feature)
GEMINI_API_KEY=your_gemini_key
\`\`\`

### 2. Run Database Migrations

\`\`\`bash
# Generate migrations (if schema changes)
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed initial bonuses
npm run db:seed
\`\`\`

### 3. Start Development Server

\`\`\`bash
# Start Vite dev server (frontend)
npm run dev

# Or start both frontend + Express API (for Gemini features)
npm run dev:full
\`\`\`

### 4. Test API Endpoints

Use Thunder Client, Postman, or curl:

\`\`\`bash
# Register
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (requires auth cookie or Bearer token)
curl http://localhost:3000/api/auth/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

---

## 📦 Deploy to Vercel

### 1. Push to GitHub

\`\`\`bash
git add .
git commit -m "Add Supabase + Drizzle backend"
git push origin main
\`\`\`

### 2. Import in Vercel

- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your GitHub repo

### 3. Add Environment Variables in Vercel

In **Project Settings → Environment Variables**, add:

- `DATABASE_URL` (Supabase pooler URL)
- `DATABASE_DIRECT_URL` (optional, for migrations)
- `JWT_SECRET` (same as local)
- `GEMINI_API_KEY` (optional)

### 4. Deploy

Vercel will auto-deploy. Your `/api/*` functions will work as serverless endpoints.

---

## 🔄 Database Management Commands

\`\`\`bash
# Reset database (drops all tables)
npm run db:reset

# Generate new migrations after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed bonuses
npm run db:seed
\`\`\`

---

## 🎯 Next Steps: Frontend Integration

Update your React components to use the new API:

### 1. Replace localStorage auth in `AppContext.tsx`

Call `/api/auth/login`, `/api/auth/register`, `/api/auth/me` instead of localStorage.

### 2. Replace spin logic in `useSlotMachine.ts`

\`\`\`ts
// Old: local evaluation
const result = engine.spin(betAmount, totalBet);

// New: server-side spin
const response = await fetch('/api/spin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ betAmount, linesPlayed }),
  credentials: 'include', // send auth cookie
});
const { round, balance } = await response.json();
\`\`\`

### 3. Update Account/History/Bonuses pages

Fetch data from:
- `/api/transactions`
- `/api/history`
- `/api/bonuses`

---

## 🔐 Security Notes

- **JWT_SECRET**: Use a strong random string in production (32+ characters)
- **Passwords**: Hashed with bcrypt (10 rounds)
- **Balance integrity**: All balance changes go through transaction ledger
- **Auth cookies**: HttpOnly, Secure (in production), SameSite=Lax

---

## 📚 Key Files

- `drizzle/schema.tsx` - Database schema
- `lib/auth.ts` - JWT + password utilities
- `lib/db-helpers.ts` - Balance calculations
- `api/` - Vercel serverless functions
- `core/evaluator.ts` - Slot game engine (server-side)

---

## ❓ Troubleshooting

**"DATABASE_URL is not set"**
- Check `.env.local` exists and has `DATABASE_URL`
- Restart dev server after adding env vars

**"Insufficient balance"**
- Check transactions table: `SELECT * FROM transactions WHERE user_id='...'`
- Balance is computed from transaction sum

**Migration errors**
- Run `npm run db:reset` to drop tables
- Delete `drizzle/migrations/*`
- Run `npm run db:generate && npm run db:migrate`

---

## 🎰 Bonus System

Bonuses are configurable in the `bonuses` table:

- **Welcome bonus**: Auto-credited on registration
- **Daily bonus**: Claimable via `/api/bonuses/claim`
- **Free spins**: Consumed automatically during `/api/spin`

Edit bonuses:
\`\`\`sql
UPDATE bonuses SET credit_amount = 200 WHERE code = 'WELCOME';
\`\`\`

Or insert via seed script.
