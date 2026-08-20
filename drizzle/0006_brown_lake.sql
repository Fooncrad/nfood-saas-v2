CREATE TABLE `remoteTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`assignedWorkerId` int,
	`type` enum('orders','reservations','social','support','marketing','other') NOT NULL DEFAULT 'other',
	`title` varchar(180) NOT NULL,
	`description` text,
	`amount` decimal(10,2) NOT NULL DEFAULT '0',
	`currency` varchar(8) NOT NULL DEFAULT 'SAR',
	`paymentMethod` enum('manual','bank_transfer','wallet','pending_gateway') NOT NULL DEFAULT 'manual',
	`paymentStatus` enum('unpaid','pending','paid','cancelled') NOT NULL DEFAULT 'unpaid',
	`status` enum('published','reviewing','accepted','in_progress','submitted','completed','cancelled') NOT NULL DEFAULT 'published',
	`dueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remoteTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remoteWorkers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(80) NOT NULL,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remoteWorkers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `remoteTasks` ADD CONSTRAINT `remoteTasks_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remoteTasks` ADD CONSTRAINT `remoteTasks_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remoteTasks` ADD CONSTRAINT `remoteTasks_assignedWorkerId_remoteWorkers_id_fk` FOREIGN KEY (`assignedWorkerId`) REFERENCES `remoteWorkers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD CONSTRAINT `remoteWorkers_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD CONSTRAINT `remoteWorkers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskMessages` ADD CONSTRAINT `taskMessages_taskId_remoteTasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `remoteTasks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskMessages` ADD CONSTRAINT `taskMessages_senderUserId_users_id_fk` FOREIGN KEY (`senderUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;