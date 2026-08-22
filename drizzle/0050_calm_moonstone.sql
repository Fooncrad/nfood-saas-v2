CREATE TABLE `packagePlanFeatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`featureId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`featureLimit` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packagePlanFeatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packagePlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(10,2) NOT NULL DEFAULT '0',
	`yearlyPrice` decimal(10,2) NOT NULL DEFAULT '0',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packagePlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `packagePlans_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `packagePlanFeatures` ADD CONSTRAINT `packagePlanFeatures_planId_packagePlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `packagePlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packagePlanFeatures` ADD CONSTRAINT `packagePlanFeatures_featureId_featureDefinitions_id_fk` FOREIGN KEY (`featureId`) REFERENCES `featureDefinitions`(`id`) ON DELETE no action ON UPDATE no action;