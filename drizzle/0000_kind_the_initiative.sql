CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`reference` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`placed_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`last_step` integer DEFAULT 1 NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`details` text NOT NULL,
	`device_type` text NOT NULL,
	`arrival_page` text NOT NULL,
	`utm_source` text NOT NULL,
	`utm_medium` text NOT NULL,
	`utm_campaign` text NOT NULL,
	`email_status` text DEFAULT 'not_configured' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_token_hash_unique` ON `orders` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_reference_unique` ON `orders` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_orders_created_at` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`attempts` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`mobile` text NOT NULL,
	`consent` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_mobile_unique` ON `subscriptions` (`mobile`);--> statement-breakpoint
CREATE TABLE `support` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`set_slug` text NOT NULL,
	`description` text NOT NULL,
	`mobile` text NOT NULL,
	`photo_key` text,
	`photo_type` text
);
