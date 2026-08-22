CREATE TABLE `menuAnalyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`eventType` enum('menu_open','qr_scan') NOT NULL,
	`visitorKey` varchar(96),
	`source` varchar(40) NOT NULL DEFAULT 'direct',
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menuAnalyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `menuAnalyticsEvents` ADD CONSTRAINT `menuAnalyticsEvents_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;