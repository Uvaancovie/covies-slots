import { config as loadEnv } from 'dotenv';

// Load env vars FIRST before importing db
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

import { db } from './index';
import { bonuses } from './schema';

async function seed() {
  try {
    console.log('🌱 Seeding bonuses...');

    await db.insert(bonuses).values([
      {
        code: 'WELCOME',
        name: 'Welcome Bonus',
        description: 'Get started with a bonus credit on your first deposit!',
        type: 'WELCOME',
        creditAmount: '100.00',
        freeSpinsCount: 0,
        isActive: true,
        rules: { minDeposit: 50, oneTimeOnly: true },
      },
      {
        code: 'DAILY_SPIN',
        name: 'Daily Free Spins',
        description: 'Claim 10 free spins every day!',
        type: 'DAILY',
        creditAmount: '0.00',
        freeSpinsCount: 10,
        isActive: true,
        rules: { validForDays: 1, claimCooldown: 86400 }, // 24 hours in seconds
      },
      {
        code: 'REFERRAL_BONUS',
        name: 'Referral Reward',
        description: 'Earn R50 for every friend you refer!',
        type: 'REFERRAL',
        creditAmount: '50.00',
        freeSpinsCount: 0,
        isActive: true,
        rules: { requiresReferralSignup: true },
      },
    ]);

    console.log('✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
