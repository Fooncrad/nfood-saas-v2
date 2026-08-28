ALTER TABLE `waiterCalls` ADD `publicToken` varchar(128);--> statement-breakpoint
ALTER TABLE `waiterCalls` ADD CONSTRAINT `waiterCalls_publicToken_unique` UNIQUE(`publicToken`);