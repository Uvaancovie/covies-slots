CREATE TABLE "bonuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"credit_amount" numeric(15, 2) DEFAULT '0',
	"free_spins_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"rules" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bonuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bet_amount" numeric(15, 2) NOT NULL,
	"win_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"is_free_spin" boolean DEFAULT false NOT NULL,
	"multiplier" numeric(5, 2) DEFAULT '1' NOT NULL,
	"result_grid" jsonb NOT NULL,
	"user_bonus_claim_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"balance_after" numeric(15, 2) NOT NULL,
	"method" varchar(100),
	"status" varchar(50) DEFAULT 'COMPLETED' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_bonus_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bonus_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"credited_amount" numeric(15, 2) DEFAULT '0',
	"free_spins_total" integer DEFAULT 0,
	"free_spins_remaining" integer DEFAULT 0,
	"expires_at" timestamp,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"referral_code" varchar(50) NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"joined_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_user_bonus_claim_id_user_bonus_claims_id_fk" FOREIGN KEY ("user_bonus_claim_id") REFERENCES "public"."user_bonus_claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bonus_claims" ADD CONSTRAINT "user_bonus_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bonus_claims" ADD CONSTRAINT "user_bonus_claims_bonus_id_bonuses_id_fk" FOREIGN KEY ("bonus_id") REFERENCES "public"."bonuses"("id") ON DELETE cascade ON UPDATE no action;