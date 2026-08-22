ALTER TABLE `orders` ADD `cancelledAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `cancellationReason` varchar(500);--> statement-breakpoint
ALTER TABLE `orders` ADD `cancelledByUserId` int;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `cancellationEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `cancellationWindowMinutes` int DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_cancelledByUserId_users_id_fk` FOREIGN KEY (`cancelledByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;