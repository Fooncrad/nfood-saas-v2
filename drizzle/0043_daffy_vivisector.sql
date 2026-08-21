CREATE TABLE `mediaFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`folderId` int,
	`ownerUserId` int,
	`restaurantId` int,
	`scope` enum('platform','restaurant','user') NOT NULL DEFAULT 'user',
	`originalName` varchar(240) NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`publicUrl` varchar(700) NOT NULL,
	`contentType` varchar(160) NOT NULL,
	`sizeBytes` int NOT NULL,
	`category` enum('image','menu','logo','document','other') NOT NULL DEFAULT 'other',
	`isDeleted` boolean NOT NULL DEFAULT false,
	`uploadedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaFiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediaFiles_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `mediaFolders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int,
	`restaurantId` int,
	`scope` enum('platform','restaurant','user') NOT NULL DEFAULT 'user',
	`name` varchar(160) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaFolders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD CONSTRAINT `mediaFiles_folderId_mediaFolders_id_fk` FOREIGN KEY (`folderId`) REFERENCES `mediaFolders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD CONSTRAINT `mediaFiles_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD CONSTRAINT `mediaFiles_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD CONSTRAINT `mediaFiles_uploadedByUserId_users_id_fk` FOREIGN KEY (`uploadedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFolders` ADD CONSTRAINT `mediaFolders_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFolders` ADD CONSTRAINT `mediaFolders_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mediaFolders` ADD CONSTRAINT `mediaFolders_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;