CREATE TABLE `qrCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`type` enum('table','order','waiter_call') NOT NULL,
	`token` varchar(120) NOT NULL,
	`label` varchar(160) NOT NULL,
	`tableId` int,
	`orderId` int,
	`amount` decimal(10,2),
	`status` enum('active','used','disabled','expired') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qrCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `qrCodes_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `qrCodes` ADD CONSTRAINT `qrCodes_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qrCodes` ADD CONSTRAINT `qrCodes_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qrCodes` ADD CONSTRAINT `qrCodes_tableId_restaurantTables_id_fk` FOREIGN KEY (`tableId`) REFERENCES `restaurantTables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qrCodes` ADD CONSTRAINT `qrCodes_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qrCodes` ADD CONSTRAINT `qrCodes_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `qrCodes_branch_type_status_idx` ON `qrCodes` (`branchId`,`type`,`status`);--> statement-breakpoint
CREATE INDEX `qrCodes_table_idx` ON `qrCodes` (`tableId`);--> statement-breakpoint
CREATE INDEX `qrCodes_order_idx` ON `qrCodes` (`orderId`);