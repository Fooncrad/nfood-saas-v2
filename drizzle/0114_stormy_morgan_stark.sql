ALTER TABLE `kitchenSections` MODIFY COLUMN `printerType` enum('network','usb','bluetooth','browser','none') NOT NULL DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `printerLogs` ADD `latencyMs` int;--> statement-breakpoint
ALTER TABLE `printerLogs` ADD `printDurationMs` int;