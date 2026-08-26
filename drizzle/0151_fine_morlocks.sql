CREATE TABLE `favoriteRestaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoriteRestaurants_id` PRIMARY KEY(`id`),
	CONSTRAINT `favoriteRestaurants_user_restaurant` UNIQUE(`userId`,`restaurantId`)
);
--> statement-breakpoint
ALTER TABLE `favoriteRestaurants` ADD CONSTRAINT `favoriteRestaurants_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoriteRestaurants` ADD CONSTRAINT `favoriteRestaurants_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;