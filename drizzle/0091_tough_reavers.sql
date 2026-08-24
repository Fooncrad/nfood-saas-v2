CREATE TABLE `contentPurchaseOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`customerUserId` int,
	`receiptMediaFileId` int,
	`itemsJson` text NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`currencyCode` varchar(8) NOT NULL DEFAULT 'SAR',
	`status` enum('unpaid','verifying','approved','rejected') NOT NULL DEFAULT 'unpaid',
	`customerName` varchar(160),
	`customerPhone` varchar(40),
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentPurchaseOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD CONSTRAINT `contentPurchaseOrders_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD CONSTRAINT `contentPurchaseOrders_customerUserId_users_id_fk` FOREIGN KEY (`customerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD CONSTRAINT `contentPurchaseOrders_receiptMediaFileId_mediaFiles_id_fk` FOREIGN KEY (`receiptMediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;