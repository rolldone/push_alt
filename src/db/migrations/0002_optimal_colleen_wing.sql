DROP INDEX "cors_entries_url_unique";--> statement-breakpoint
DROP INDEX "settings_name_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "refresh_token_token_unique";--> statement-breakpoint
ALTER TABLE `cors_entries` ALTER COLUMN "created_at" TO "created_at" text DEFAULT (CURRENT_TIMESTAMP);--> statement-breakpoint
CREATE UNIQUE INDEX `cors_entries_url_unique` ON `cors_entries` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `settings_name_unique` ON `settings` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_token_token_unique` ON `refresh_token` (`token`);--> statement-breakpoint
ALTER TABLE `cors_entries` ALTER COLUMN "updated_at" TO "updated_at" text DEFAULT (CURRENT_TIMESTAMP);