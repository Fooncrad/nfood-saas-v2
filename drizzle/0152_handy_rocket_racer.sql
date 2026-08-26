CREATE TABLE `customerBenefitFeatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`label` varchar(160) NOT NULL,
	`description` text,
	`category` varchar(80) NOT NULL DEFAULT 'customer',
	`isActive` boolean NOT NULL DEFAULT true,
	`isAddOn` boolean NOT NULL DEFAULT false,
	`addonPrice` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerBenefitFeatures_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerBenefitFeatures_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `customerBenefitPlanFeatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`featureId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerBenefitPlanFeatures_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_benefit_plan_feature_unique` UNIQUE(`planId`,`featureId`)
);
--> statement-breakpoint
CREATE TABLE `customerBenefitPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(10,2) NOT NULL DEFAULT '0',
	`yearlyPrice` decimal(10,2) NOT NULL DEFAULT '0',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerBenefitPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerBenefitPlans_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `customerBenefitRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`featureId` int NOT NULL,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`requestedPrice` decimal(10,2),
	`currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
	`notes` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerBenefitRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerBenefitSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('active','pending','cancelled','expired') NOT NULL DEFAULT 'active',
	`startsAt` timestamp NOT NULL DEFAULT (now()),
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerBenefitSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customerBenefitPlanFeatures` ADD CONSTRAINT `cbpf_plan_fk` FOREIGN KEY (`planId`) REFERENCES `customerBenefitPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerBenefitPlanFeatures` ADD CONSTRAINT `cbpf_feature_fk` FOREIGN KEY (`featureId`) REFERENCES `customerBenefitFeatures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerBenefitRequests` ADD CONSTRAINT `cbr_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerBenefitRequests` ADD CONSTRAINT `cbr_feature_fk` FOREIGN KEY (`featureId`) REFERENCES `customerBenefitFeatures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerBenefitRequests` ADD CONSTRAINT `cbr_reviewer_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerBenefitSubscriptions` ADD CONSTRAINT `cbs_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerBenefitSubscriptions` ADD CONSTRAINT `cbs_plan_fk` FOREIGN KEY (`planId`) REFERENCES `customerBenefitPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `customer_benefit_request_user_feature_status_idx` ON `customerBenefitRequests` (`userId`,`featureId`,`status`);--> statement-breakpoint
CREATE INDEX `customer_benefit_subscription_user_status_idx` ON `customerBenefitSubscriptions` (`userId`,`status`);