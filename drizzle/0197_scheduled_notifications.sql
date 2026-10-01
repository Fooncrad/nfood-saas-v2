CREATE TABLE `scheduledNotifications` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(180) NOT NULL,
  `body` text NOT NULL,
  `type` enum('task','message','payment','system') NOT NULL DEFAULT 'system',
  `targetType` enum('all','customers','restaurants','admins','selected') NOT NULL DEFAULT 'all',
  `targetUserIdsJson` text,
  `scheduleCron` varchar(80) NOT NULL,
  `scheduleCronTaskUid` varchar(65),
  `status` enum('scheduled','paused','deleted') NOT NULL DEFAULT 'scheduled',
  `createdByUserId` int NOT NULL,
  `lastRunAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `scheduledNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `scheduledNotifications` ADD CONSTRAINT `scheduledNotifications_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
