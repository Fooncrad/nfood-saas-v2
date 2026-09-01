ALTER TABLE `menuItemAddons` ADD `groupName` varchar(120) DEFAULT 'الإضافات الاختيارية' NOT NULL;--> statement-breakpoint
ALTER TABLE `menuItemAddons` ADD `isRequired` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `menuItemAddons` ADD `minSelections` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `menuItemAddons` ADD `maxSelections` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `menuItemAddons` ADD `sortOrder` int DEFAULT 0 NOT NULL;