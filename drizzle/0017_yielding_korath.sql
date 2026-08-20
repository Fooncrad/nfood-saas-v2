ALTER TABLE `restaurants` ADD `brandName` varchar(160);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandColor` varchar(7) DEFAULT '#e76f3c';--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandLogoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandDescription` text;