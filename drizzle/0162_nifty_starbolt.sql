CREATE TABLE `waiterCalls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`tableId` int NOT NULL,
	`waiterUserId` int NOT NULL,
	`reason` varchar(80) NOT NULL,
	`status` enum('active','acknowledged','closed','expired') NOT NULL DEFAULT 'active',
	`customerName` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledgedAt` timestamp,
	`closedAt` timestamp,
	CONSTRAINT `waiterCalls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `waiterCalls` ADD CONSTRAINT `waiterCalls_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterCalls` ADD CONSTRAINT `waiterCalls_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterCalls` ADD CONSTRAINT `waiterCalls_tableId_restaurantTables_id_fk` FOREIGN KEY (`tableId`) REFERENCES `restaurantTables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterCalls` ADD CONSTRAINT `waiterCalls_waiterUserId_users_id_fk` FOREIGN KEY (`waiterUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `waiter_calls_table_status_idx` ON `waiterCalls` (`tableId`,`status`);--> statement-breakpoint
CREATE INDEX `waiter_calls_waiter_status_idx` ON `waiterCalls` (`waiterUserId`,`status`);--> statement-breakpoint
CREATE INDEX `waiter_calls_branch_created_idx` ON `waiterCalls` (`branchId`,`createdAt`);