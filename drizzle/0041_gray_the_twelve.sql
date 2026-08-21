CREATE TABLE `vcardCardBindings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codeId` int NOT NULL,
	`userId` int NOT NULL,
	`customerProfileId` int,
	`restaurantId` int,
	`targetRole` enum('customer','restaurant','driver') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vcardCardBindings_id` PRIMARY KEY(`id`),
	CONSTRAINT `vcardCardBindings_codeId_unique` UNIQUE(`codeId`)
);
--> statement-breakpoint
CREATE TABLE `vcardCardCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`codeHash` varchar(128) NOT NULL,
	`codeLast4` varchar(4) NOT NULL,
	`status` enum('available','reserved','bound','disabled') NOT NULL DEFAULT 'available',
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`boundAt` timestamp,
	CONSTRAINT `vcardCardCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `vcardCardCodes_codeHash_unique` UNIQUE(`codeHash`)
);
--> statement-breakpoint
CREATE TABLE `vcardCardOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`restaurantId` int,
	`status` enum('pending_payment','paid','cancelled','fulfilled') NOT NULL DEFAULT 'pending_payment',
	`paymentProvider` varchar(80),
	`externalPaymentId` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vcardCardOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vcardCardProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'SAR',
	`targetRole` enum('customer','restaurant','driver') NOT NULL DEFAULT 'customer',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vcardCardProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vcardCardBindings` ADD CONSTRAINT `vcardCardBindings_codeId_vcardCardCodes_id_fk` FOREIGN KEY (`codeId`) REFERENCES `vcardCardCodes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardBindings` ADD CONSTRAINT `vcardCardBindings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardBindings` ADD CONSTRAINT `vcardCardBindings_customerProfileId_customerProfiles_id_fk` FOREIGN KEY (`customerProfileId`) REFERENCES `customerProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardBindings` ADD CONSTRAINT `vcardCardBindings_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardCodes` ADD CONSTRAINT `vcardCardCodes_productId_vcardCardProducts_id_fk` FOREIGN KEY (`productId`) REFERENCES `vcardCardProducts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardCodes` ADD CONSTRAINT `vcardCardCodes_orderId_vcardCardOrders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `vcardCardOrders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD CONSTRAINT `vcardCardOrders_productId_vcardCardProducts_id_fk` FOREIGN KEY (`productId`) REFERENCES `vcardCardProducts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD CONSTRAINT `vcardCardOrders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD CONSTRAINT `vcardCardOrders_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;