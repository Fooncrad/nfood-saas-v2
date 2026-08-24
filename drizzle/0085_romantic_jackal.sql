CREATE TABLE `seatingSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`seatingType` enum('indoor','outdoor') NOT NULL DEFAULT 'indoor',
	`smokingAllowed` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seatingSections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `seatingSectionId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `childrenCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `policyAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `splitBillMode` enum('single','restaurant_required','customer_choice','friends') DEFAULT 'single' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `splitBillGroupId` varchar(80);--> statement-breakpoint
ALTER TABLE `reservations` ADD `seatingSectionId` int;--> statement-breakpoint
ALTER TABLE `reservations` ADD `childrenCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `policyAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `restaurantTables` ADD `seatingSectionId` int;--> statement-breakpoint
ALTER TABLE `seatingSections` ADD CONSTRAINT `seatingSections_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seatingSections` ADD CONSTRAINT `seatingSections_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `seatingSections_branch_active_idx` ON `seatingSections` (`branchId`,`isActive`);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_seatingSectionId_seatingSections_id_fk` FOREIGN KEY (`seatingSectionId`) REFERENCES `seatingSections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_seatingSectionId_seatingSections_id_fk` FOREIGN KEY (`seatingSectionId`) REFERENCES `seatingSections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantTables` ADD CONSTRAINT `restaurantTables_seatingSectionId_seatingSections_id_fk` FOREIGN KEY (`seatingSectionId`) REFERENCES `seatingSections`(`id`) ON DELETE no action ON UPDATE no action;