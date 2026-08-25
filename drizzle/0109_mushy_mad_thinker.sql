CREATE TABLE `printerLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`kitchenSectionId` int NOT NULL,
	`operation` enum('health_check','test_print','print') NOT NULL,
	`result` enum('success','error') NOT NULL,
	`message` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `printerLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `kitchenSections` ADD `printerPurpose` enum('kitchen','receipt','general') DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `kitchenSections` ADD `printerStatus` enum('unknown','connected','offline') DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `kitchenSections` ADD `printerLastCheckedAt` timestamp;--> statement-breakpoint
ALTER TABLE `kitchenSections` ADD `printerLastError` varchar(500);--> statement-breakpoint
ALTER TABLE `printerLogs` ADD CONSTRAINT `printerLogs_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `printerLogs` ADD CONSTRAINT `printerLogs_kitchenSectionId_kitchenSections_id_fk` FOREIGN KEY (`kitchenSectionId`) REFERENCES `kitchenSections`(`id`) ON DELETE no action ON UPDATE no action;