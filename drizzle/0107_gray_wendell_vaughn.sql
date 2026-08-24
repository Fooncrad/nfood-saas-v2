ALTER TABLE `orders` ADD `serviceFeeAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `tipAmount` decimal(10,2) DEFAULT '0' NOT NULL;