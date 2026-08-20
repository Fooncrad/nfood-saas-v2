CREATE TABLE `remoteWorkerApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`applicantUserId` int NOT NULL,
	`role` varchar(80) NOT NULL,
	`message` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remoteWorkerApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `remoteWorkerApplications` ADD CONSTRAINT `remoteWorkerApplications_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remoteWorkerApplications` ADD CONSTRAINT `remoteWorkerApplications_applicantUserId_users_id_fk` FOREIGN KEY (`applicantUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `remoteWorkerApplications` ADD CONSTRAINT `remoteWorkerApplications_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;