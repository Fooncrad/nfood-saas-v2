CREATE TABLE `subscriptionTransferReceipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int,
	`email` varchar(320) NOT NULL,
	`plan` varchar(80) NOT NULL,
	`billingCycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`amount` decimal(10,2) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewNote` text,
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `subscriptionTransferReceipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `subscriptionTransferReceipts` ADD CONSTRAINT `subscriptionTransferReceipts_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptionTransferReceipts` ADD CONSTRAINT `subscriptionTransferReceipts_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;