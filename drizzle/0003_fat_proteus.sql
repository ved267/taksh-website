CREATE TABLE `reporting_state` (
	`key` text PRIMARY KEY NOT NULL,
	`updated_at` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `traffic_type` text DEFAULT 'external' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `referrer` text DEFAULT '' NOT NULL;