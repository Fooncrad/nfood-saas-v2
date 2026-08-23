ALTER TABLE `branches` ADD `countryCode` varchar(2);--> statement-breakpoint
ALTER TABLE `branches` ADD `currencyCode` varchar(3);--> statement-breakpoint
ALTER TABLE `branches` ADD `currencyDecimals` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `countryCode` varchar(2) DEFAULT 'SA' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `currencyCode` varchar(3) DEFAULT 'SAR' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `currencyDecimals` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `countryCode` varchar(2) DEFAULT 'SA' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `currencyCode` varchar(3) DEFAULT 'SAR' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `currencyDecimals` int DEFAULT 2 NOT NULL;