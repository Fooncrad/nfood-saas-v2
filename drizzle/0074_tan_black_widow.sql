CREATE TABLE `kitchenSectionSla` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`kitchenSectionId` int NOT NULL,
	`thresholdMinutes` int NOT NULL DEFAULT 15,
	`updatedByUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kitchenSectionSla_id` PRIMARY KEY(`id`),
	CONSTRAINT `kitchenSectionSla_restaurant_section_uidx` UNIQUE(`restaurantId`,`kitchenSectionId`)
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`orderId` int NOT NULL,
	`fromStatus` varchar(40),
	`toStatus` varchar(40) NOT NULL,
	`actorUserId` int,
	`durationSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `kitchenSectionSla` ADD CONSTRAINT `kitchenSectionSla_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kitchenSectionSla` ADD CONSTRAINT `kitchenSectionSla_kitchenSectionId_kitchenSections_id_fk` FOREIGN KEY (`kitchenSectionId`) REFERENCES `kitchenSections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kitchenSectionSla` ADD CONSTRAINT `kitchenSectionSla_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `orderStatusHistory_order_created_idx` ON `orderStatusHistory` (`orderId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orderStatusHistory_restaurant_created_idx` ON `orderStatusHistory` (`restaurantId`,`createdAt`);