ALTER TABLE `featureDefinitions` ADD `category` varchar(80) DEFAULT 'core' NOT NULL;--> statement-breakpoint
ALTER TABLE `featureDefinitions` ADD `description` text;--> statement-breakpoint
ALTER TABLE `featureDefinitions` ADD `status` enum('ON','OFF','LIMITED','ADD_ON','ENTERPRISE_ONLY') DEFAULT 'ON' NOT NULL;--> statement-breakpoint
ALTER TABLE `packagePlans` ADD `planType` enum('free','monthly','yearly','trial','enterprise') DEFAULT 'monthly' NOT NULL;