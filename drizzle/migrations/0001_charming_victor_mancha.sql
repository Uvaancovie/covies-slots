CREATE INDEX "game_rounds_user_id_idx" ON "game_rounds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_rounds_created_at_idx" ON "game_rounds" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_user_id_created_at_idx" ON "transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "user_bonus_claims_user_id_idx" ON "user_bonus_claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_bonus_claims_status_idx" ON "user_bonus_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_bonus_claims_user_id_status_idx" ON "user_bonus_claims" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");