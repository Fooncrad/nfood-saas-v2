ALTER TABLE `restaurantTables` ADD `tableType` varchar(80) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantTables` ADD `minimumCharge` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantTables` ADD `tableFee` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `tipsEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `tipPercent` decimal(5,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `serviceFeeEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `serviceFeePercent` decimal(5,2) DEFAULT '0' NOT NULL;