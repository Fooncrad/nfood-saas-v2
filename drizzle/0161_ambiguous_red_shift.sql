CREATE TABLE `reservationBlackoutDates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`blackoutDate` varchar(10) NOT NULL,
	`reason` varchar(500) NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservationBlackoutDates_id` PRIMARY KEY(`id`),
	CONSTRAINT `reservation_blackout_branch_date_unique` UNIQUE(`branchId`,`blackoutDate`)
);
--> statement-breakpoint
ALTER TABLE `restaurants` ADD `waiterCallEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `waiterCallCooldownMinutes` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `reservationHelpText` text;--> statement-breakpoint
ALTER TABLE `reservationBlackoutDates` ADD CONSTRAINT `reservationBlackoutDates_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationBlackoutDates` ADD CONSTRAINT `reservationBlackoutDates_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationBlackoutDates` ADD CONSTRAINT `reservationBlackoutDates_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `reservation_blackout_restaurant_date_idx` ON `reservationBlackoutDates` (`restaurantId`,`blackoutDate`);