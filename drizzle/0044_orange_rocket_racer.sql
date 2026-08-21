CREATE TABLE `menuItemAddons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`menuItemId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menuItemAddons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `menuItemAddons` ADD CONSTRAINT `menuItemAddons_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menuItemAddons` ADD CONSTRAINT `menuItemAddons_menuItemId_menuItems_id_fk` FOREIGN KEY (`menuItemId`) REFERENCES `menuItems`(`id`) ON DELETE no action ON UPDATE no action;