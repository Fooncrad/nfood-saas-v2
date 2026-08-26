ALTER TABLE `contentPurchaseOrders` MODIFY COLUMN `restaurantId` int;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `buyerUserId` int;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `buyerType` enum('restaurant','customer') DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `paymentSource` enum('wallet','manual') DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD CONSTRAINT `contentPurchaseOrders_buyerUserId_users_id_fk` FOREIGN KEY (`buyerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;