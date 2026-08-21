ALTER TABLE `restaurants` ADD `customDomain` varchar(255);--> statement-breakpoint
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_customDomain_unique` UNIQUE(`customDomain`);