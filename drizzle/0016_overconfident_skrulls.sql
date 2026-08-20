ALTER TABLE `subscriptions` ADD `monthlyPrice` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `cancelledAt` timestamp;