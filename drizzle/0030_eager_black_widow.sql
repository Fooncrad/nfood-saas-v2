CREATE TABLE `integrationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` enum('platform','restaurant') NOT NULL,
	`restaurantId` int,
	`providerKey` varchar(120) NOT NULL,
	`category` varchar(80) NOT NULL,
	`status` enum('not_configured','configured','disabled') NOT NULL DEFAULT 'not_configured',
	`keyReference` varchar(180),
	`updatedByUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrationSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `integrationSettings` ADD CONSTRAINT `integrationSettings_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;