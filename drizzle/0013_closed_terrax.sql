ALTER TABLE `orders` ADD `customerId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `driverId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_driverId_users_id_fk` FOREIGN KEY (`driverId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;