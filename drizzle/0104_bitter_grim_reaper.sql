ALTER TABLE `restaurants` ADD `seoTitle` varchar(180);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `seoDescription` varchar(320);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `seoKeywords` text;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `seoHashtags` text;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `seoImageUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `seoCanonicalUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `seoRobots` varchar(120) DEFAULT 'index,follow';--> statement-breakpoint
ALTER TABLE `restaurants` ADD `googleSearchConsoleVerification` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `googleAnalyticsMeasurementId` varchar(80);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `googleTagManagerId` varchar(80);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `structuredDataJson` text;