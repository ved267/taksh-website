CREATE TABLE `support_uploads` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`photo_key` text NOT NULL,
	`photo_type` text NOT NULL,
	`total_size` integer NOT NULL,
	`fields` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `support_uploads_expiry` ON `support_uploads` (`expires_at`);