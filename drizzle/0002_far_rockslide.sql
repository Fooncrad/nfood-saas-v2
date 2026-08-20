CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`label` varchar(160) NOT NULL,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `restaurantMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`userId` int NOT NULL,
	`roleId` int,
	`branchId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurantMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rolePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	CONSTRAINT `rolePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int,
	`name` varchar(80) NOT NULL,
	`scope` enum('platform','restaurant') NOT NULL DEFAULT 'restaurant',
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`plan` varchar(64) NOT NULL,
	`status` enum('trial','active','past_due','cancelled') NOT NULL DEFAULT 'trial',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`renewsAt` timestamp,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
