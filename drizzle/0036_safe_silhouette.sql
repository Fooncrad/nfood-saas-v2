CREATE TABLE `kitchenSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`printerName` varchar(160),
	`printerType` enum('network','usb','browser','none') NOT NULL DEFAULT 'none',
	`printerAddress` varchar(255),
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kitchenSections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `printerRoutingRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`kitchenSectionId` int NOT NULL,
	`categoryId` int,
	`menuItemId` int,
	`priority` int NOT NULL DEFAULT 0,
	`isEnabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `printerRoutingRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `menuItems` ADD `kitchenSectionId` int;--> statement-breakpoint
ALTER TABLE `kitchenSections` ADD CONSTRAINT `kitchenSections_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `printerRoutingRules` ADD CONSTRAINT `printerRoutingRules_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `printerRoutingRules` ADD CONSTRAINT `printerRoutingRules_kitchenSectionId_kitchenSections_id_fk` FOREIGN KEY (`kitchenSectionId`) REFERENCES `kitchenSections`(`id`) ON DELETE no action ON UPDATE no action;