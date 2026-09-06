ALTER TABLE `orders` ADD `restaurantAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `restaurantReadyAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `driverPickedUpAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `cashDebtAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `driverEarningAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `driverEarningType` enum('commission','salary','none') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `compensationType` enum('commission','salary') DEFAULT 'commission' NOT NULL;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `commissionRate` decimal(5,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `remoteWorkers` ADD `salaryAmount` decimal(10,2) DEFAULT '0' NOT NULL;