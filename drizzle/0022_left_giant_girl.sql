ALTER TABLE `restaurants` ADD `phone` varchar(40);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `whatsapp` varchar(40);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `instagramUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `facebookUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `tiktokUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `websiteUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `reservationEnabled` boolean DEFAULT true NOT NULL;