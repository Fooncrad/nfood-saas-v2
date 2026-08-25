CREATE TABLE `featureRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`requestedByUserId` int NOT NULL,
	`featureKey` varchar(120) NOT NULL,
	`featureLabel` varchar(180) NOT NULL,
	`requestedPrice` decimal(10,2),
	`currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotelRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`roomNumber` varchar(40) NOT NULL,
	`floor` varchar(40),
	`syncKey` varchar(120),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotelRooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotel_rooms_hotel_room_number_uidx` UNIQUE(`hotelId`,`roomNumber`)
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`code` varchar(80),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `hotelId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `hotelRoomId` int;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `vehicleType` varchar(40);--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `lastLocationAt` timestamp;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `deliveryManagementMode` enum('restaurant','platform') DEFAULT 'restaurant' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `platformDeliveryEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `featureRequests` ADD CONSTRAINT `featureRequests_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `featureRequests` ADD CONSTRAINT `featureRequests_requestedByUserId_users_id_fk` FOREIGN KEY (`requestedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `featureRequests` ADD CONSTRAINT `featureRequests_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotelRooms` ADD CONSTRAINT `hotelRooms_hotelId_hotels_id_fk` FOREIGN KEY (`hotelId`) REFERENCES `hotels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotels` ADD CONSTRAINT `hotels_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotels` ADD CONSTRAINT `hotels_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `feature_requests_restaurant_feature_status_idx` ON `featureRequests` (`restaurantId`,`featureKey`,`status`);--> statement-breakpoint
CREATE INDEX `hotel_rooms_hotel_active_idx` ON `hotelRooms` (`hotelId`,`isActive`);--> statement-breakpoint
CREATE INDEX `hotels_restaurant_branch_idx` ON `hotels` (`restaurantId`,`branchId`);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_hotelId_hotels_id_fk` FOREIGN KEY (`hotelId`) REFERENCES `hotels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_hotelRoomId_hotelRooms_id_fk` FOREIGN KEY (`hotelRoomId`) REFERENCES `hotelRooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `remote_workers_restaurant_role_availability_idx` ON `remoteWorkers` (`restaurantId`,`role`,`isActive`,`isAvailable`);