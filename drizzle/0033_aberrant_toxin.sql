ALTER TABLE `restaurants` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationExpiresAt` timestamp;