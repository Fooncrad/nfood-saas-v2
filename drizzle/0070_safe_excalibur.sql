CREATE TABLE `receiptTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`headerText` varchar(240) NOT NULL DEFAULT '',
	`footerText` varchar(240) NOT NULL DEFAULT 'شكراً لزيارتكم',
	`logoUrl` varchar(500),
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `receiptTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `receiptTemplates_restaurantId_unique` UNIQUE(`restaurantId`)
);
--> statement-breakpoint
ALTER TABLE `receiptTemplates` ADD CONSTRAINT `receiptTemplates_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receiptTemplates` ADD CONSTRAINT `receiptTemplates_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;