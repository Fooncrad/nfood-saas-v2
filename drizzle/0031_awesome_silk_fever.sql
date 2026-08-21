ALTER TABLE `campaigns` ADD `kind` enum('general','birthday','reengagement') DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `reengagementDays` int DEFAULT 30;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `scheduleCronTaskUid` varchar(65);--> statement-breakpoint
ALTER TABLE `users` ADD `birthDate` timestamp;