CREATE TABLE `deliveryLocationAccess` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverUserId` int NOT NULL,
	`grantedByUserId` int,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveryLocationAccess_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`senderRole` enum('customer','driver','restaurant','admin') NOT NULL,
	`body` varchar(1000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `deliveryMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `deliveryLocationAccess` ADD CONSTRAINT `deliveryLocationAccess_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveryLocationAccess` ADD CONSTRAINT `deliveryLocationAccess_driverUserId_users_id_fk` FOREIGN KEY (`driverUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveryLocationAccess` ADD CONSTRAINT `deliveryLocationAccess_grantedByUserId_users_id_fk` FOREIGN KEY (`grantedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveryMessages` ADD CONSTRAINT `deliveryMessages_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveryMessages` ADD CONSTRAINT `deliveryMessages_senderUserId_users_id_fk` FOREIGN KEY (`senderUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `delivery_location_order_driver_idx` ON `deliveryLocationAccess` (`orderId`,`driverUserId`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `delivery_messages_order_created_idx` ON `deliveryMessages` (`orderId`,`createdAt`);