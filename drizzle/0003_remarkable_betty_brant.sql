CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`workDate` varchar(16) NOT NULL,
	`status` enum('present','absent','late') NOT NULL DEFAULT 'present',
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`status` enum('draft','scheduled','active','ended') NOT NULL DEFAULT 'draft',
	`startsAt` timestamp,
	`endsAt` timestamp,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`discountPercent` int NOT NULL DEFAULT 0,
	`usageLimit` int,
	`usedCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`supplier` varchar(160) NOT NULL,
	`total` decimal(10,2) NOT NULL DEFAULT '0',
	`status` enum('draft','received','cancelled') NOT NULL DEFAULT 'received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurantTables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`seats` int NOT NULL DEFAULT 2,
	`status` enum('available','occupied','reserved') NOT NULL DEFAULT 'available',
	CONSTRAINT `restaurantTables_id` PRIMARY KEY(`id`)
);
