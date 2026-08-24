ALTER TABLE `contentListings` ADD `contentCategory` varchar(40) DEFAULT 'events' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentListings` ADD `watermarkEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `manualPaymentMethodsJson` text DEFAULT ('["cash","bank_transfer"]');--> statement-breakpoint
ALTER TABLE `restaurants` ADD `manualPaymentInstructions` varchar(1000);