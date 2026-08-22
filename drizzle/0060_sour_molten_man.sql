ALTER TABLE `restaurantDisplayScreens` ADD `publicToken` varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantDisplaySlides` ADD `campaignId` int;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD CONSTRAINT `restaurantDisplayScreens_publicToken_unique` UNIQUE(`publicToken`);--> statement-breakpoint
ALTER TABLE `restaurantDisplaySlides` ADD CONSTRAINT `restaurantDisplaySlides_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE no action ON UPDATE no action;