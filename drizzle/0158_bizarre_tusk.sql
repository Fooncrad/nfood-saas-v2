CREATE TABLE `restaurantMenuLayoutTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`settingsJson` text NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurantMenuLayoutTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandAccentColor` varchar(7) DEFAULT '#f59e0b' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandTextColor` varchar(7) DEFAULT '#172033' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandFontFamily` varchar(120) DEFAULT 'IBM Plex Sans Arabic' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `brandHeadingFontFamily` varchar(120) DEFAULT 'IBM Plex Sans Arabic' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantMenuLayoutTemplates` ADD CONSTRAINT `restaurantMenuLayoutTemplates_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantMenuLayoutTemplates` ADD CONSTRAINT `restaurantMenuLayoutTemplates_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `restaurant_menu_layout_templates_restaurant_updated_idx` ON `restaurantMenuLayoutTemplates` (`restaurantId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `restaurant_menu_layout_templates_restaurant_name_idx` ON `restaurantMenuLayoutTemplates` (`restaurantId`,`name`);