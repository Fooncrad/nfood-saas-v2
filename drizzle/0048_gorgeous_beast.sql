CREATE TABLE `translationErrorLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`entityType` enum('category','item') NOT NULL,
	`entityId` int NOT NULL,
	`sourceLanguage` varchar(10) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`sourceName` text NOT NULL,
	`errorMessage` text NOT NULL,
	`status` enum('open','resolved') NOT NULL DEFAULT 'open',
	`attempts` int NOT NULL DEFAULT 1,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `translationErrorLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `translationErrorLogs` ADD CONSTRAINT `translationErrorLogs_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translationErrorLogs` ADD CONSTRAINT `translationErrorLogs_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;