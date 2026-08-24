CREATE TABLE `contentListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`mediaFileId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` varchar(1000),
	`price` decimal(10,2) NOT NULL,
	`currencyCode` varchar(8) NOT NULL DEFAULT 'SAR',
	`status` enum('draft','published','paused') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contentListings` ADD CONSTRAINT `contentListings_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentListings` ADD CONSTRAINT `contentListings_mediaFileId_mediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentListings` ADD CONSTRAINT `contentListings_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;