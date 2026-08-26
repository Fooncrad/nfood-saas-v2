CREATE TABLE `uiTranslationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` int NOT NULL,
	`translationKey` varchar(220) NOT NULL,
	`sourceTextBefore` text,
	`sourceTextAfter` text,
	`translatedTextBefore` text,
	`translatedTextAfter` text,
	`statusBefore` varchar(20),
	`statusAfter` varchar(20),
	`action` enum('manual_edit','auto_draft','bulk_publish','csv_import') NOT NULL,
	`changedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uiTranslationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `uiTranslationHistory` ADD CONSTRAINT `uiTranslationHistory_entryId_uiTranslationEntries_id_fk` FOREIGN KEY (`entryId`) REFERENCES `uiTranslationEntries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uiTranslationHistory` ADD CONSTRAINT `uiTranslationHistory_changedByUserId_users_id_fk` FOREIGN KEY (`changedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ui_translation_history_entry_idx` ON `uiTranslationHistory` (`entryId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ui_translation_history_action_idx` ON `uiTranslationHistory` (`action`,`createdAt`);