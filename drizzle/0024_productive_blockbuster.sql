CREATE TABLE `loyaltyAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`customerId` int NOT NULL,
	`pointsBalance` int NOT NULL DEFAULT 0,
	`tier` varchar(40) NOT NULL DEFAULT 'standard',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`customerId` int NOT NULL,
	`orderId` int,
	`points` int NOT NULL,
	`type` enum('earn','adjust','redeem') NOT NULL DEFAULT 'earn',
	`note` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`referrerCustomerId` int NOT NULL,
	`referredCustomerId` int,
	`qualifyingOrderId` int,
	`code` varchar(80) NOT NULL,
	`status` enum('pending','qualified','rewarded','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`qualifiedAt` timestamp,
	CONSTRAINT `referralRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `loyaltyAccounts` ADD CONSTRAINT `loyaltyAccounts_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyaltyAccounts` ADD CONSTRAINT `loyaltyAccounts_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyaltyTransactions` ADD CONSTRAINT `loyaltyTransactions_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyaltyTransactions` ADD CONSTRAINT `loyaltyTransactions_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyaltyTransactions` ADD CONSTRAINT `loyaltyTransactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralRecords` ADD CONSTRAINT `referralRecords_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralRecords` ADD CONSTRAINT `referralRecords_referrerCustomerId_users_id_fk` FOREIGN KEY (`referrerCustomerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralRecords` ADD CONSTRAINT `referralRecords_referredCustomerId_users_id_fk` FOREIGN KEY (`referredCustomerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referralRecords` ADD CONSTRAINT `referralRecords_qualifyingOrderId_orders_id_fk` FOREIGN KEY (`qualifyingOrderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;