CREATE TABLE `restaurantDisplayMatchModes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`status` enum('idle','live') NOT NULL DEFAULT 'idle',
	`headline` varchar(180) NOT NULL,
	`body` text,
	`callToAction` varchar(120),
	`mediaFileId` int,
	`qrTargetUrl` varchar(700),
	`countdownEndsAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurantDisplayMatchModes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `restaurantDisplayMatchModes` ADD CONSTRAINT `restaurantDisplayMatchModes_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplayMatchModes` ADD CONSTRAINT `restaurantDisplayMatchModes_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplayMatchModes` ADD CONSTRAINT `restaurantDisplayMatchModes_mediaFileId_mediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplayMatchModes` ADD CONSTRAINT `restaurantDisplayMatchModes_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;