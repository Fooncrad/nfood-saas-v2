CREATE TABLE `deliveryZones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`centerLatitude` decimal(10,7) NOT NULL,
	`centerLongitude` decimal(10,7) NOT NULL,
	`radiusKm` decimal(8,2) NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0',
	`minimumOrder` decimal(10,2) NOT NULL DEFAULT '0',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryZones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favoriteMenuItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`menuItemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoriteMenuItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `favoriteMenuItems_user_restaurant_item` UNIQUE(`userId`,`restaurantId`,`menuItemId`)
);
--> statement-breakpoint
CREATE TABLE `pickupPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`address` varchar(500),
	`openingTime` varchar(5),
	`closingTime` varchar(5),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pickupPoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservationSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`capacity` int NOT NULL DEFAULT 1,
	`slotDurationMinutes` int NOT NULL DEFAULT 60,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservationSlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'ar',
	`themeMode` enum('light','dark','system') NOT NULL DEFAULT 'system',
	`themePreset` varchar(40) NOT NULL DEFAULT 'nfood-sunset',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `deliveryZones` ADD CONSTRAINT `deliveryZones_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveryZones` ADD CONSTRAINT `deliveryZones_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoriteMenuItems` ADD CONSTRAINT `favoriteMenuItems_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoriteMenuItems` ADD CONSTRAINT `favoriteMenuItems_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoriteMenuItems` ADD CONSTRAINT `favoriteMenuItems_menuItemId_menuItems_id_fk` FOREIGN KEY (`menuItemId`) REFERENCES `menuItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pickupPoints` ADD CONSTRAINT `pickupPoints_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pickupPoints` ADD CONSTRAINT `pickupPoints_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationSlots` ADD CONSTRAINT `reservationSlots_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationSlots` ADD CONSTRAINT `reservationSlots_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;