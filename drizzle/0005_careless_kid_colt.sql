ALTER TABLE `restaurants` ADD `barcode` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_barcode_unique` UNIQUE(`barcode`);