CREATE TABLE `whiteLabelWorkspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`logoUrl` varchar(500),
	`primaryColor` varchar(16) NOT NULL DEFAULT '#E76F3C',
	`accentColor` varchar(16) NOT NULL DEFAULT '#172033',
	`customDomain` varchar(255),
	`defaultLocale` varchar(10) NOT NULL DEFAULT 'ar',
	`enabledModulesJson` text NOT NULL,
	`status` enum('draft','active','suspended') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whiteLabelWorkspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `white_label_workspace_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `whiteLabelWorkspaces` ADD CONSTRAINT `whiteLabelWorkspaces_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `white_label_workspace_owner_status_idx` ON `whiteLabelWorkspaces` (`ownerUserId`,`status`);--> statement-breakpoint
CREATE INDEX `white_label_workspace_domain_idx` ON `whiteLabelWorkspaces` (`customDomain`);