CREATE TABLE `waiterTableAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int NOT NULL,
	`waiterUserId` int NOT NULL,
	`tableId` int NOT NULL,
	`assignedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waiterTableAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `waiter_table_assignments_unique` UNIQUE(`waiterUserId`,`tableId`)
);
--> statement-breakpoint
ALTER TABLE `waiterTableAssignments` ADD CONSTRAINT `waiterTableAssignments_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterTableAssignments` ADD CONSTRAINT `waiterTableAssignments_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterTableAssignments` ADD CONSTRAINT `waiterTableAssignments_waiterUserId_users_id_fk` FOREIGN KEY (`waiterUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterTableAssignments` ADD CONSTRAINT `waiterTableAssignments_tableId_restaurantTables_id_fk` FOREIGN KEY (`tableId`) REFERENCES `restaurantTables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiterTableAssignments` ADD CONSTRAINT `waiterTableAssignments_assignedByUserId_users_id_fk` FOREIGN KEY (`assignedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `waiter_table_assignments_branch_waiter_idx` ON `waiterTableAssignments` (`branchId`,`waiterUserId`);