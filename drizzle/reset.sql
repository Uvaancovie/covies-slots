-- Reset script: drop all tables to start fresh with new schema
-- Run this once before running db:migrate

DROP TABLE IF EXISTS user_bonus_claims CASCADE;
DROP TABLE IF EXISTS game_rounds CASCADE;
DROP TABLE IF EXISTS bonuses CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
