ALTER TABLE `restaurantDisplayScreens` ADD `qrEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD `qrPosition` enum('top-left','top-right','bottom-left','bottom-right','center') DEFAULT 'bottom-right' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD `qrSize` int DEFAULT 180 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD `qrForeground` varchar(20) DEFAULT '#ffffff' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD `qrBackground` varchar(20) DEFAULT '#111c2e' NOT NULL;