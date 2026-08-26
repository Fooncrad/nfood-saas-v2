CREATE TABLE `uiTranslationEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`translationKey` varchar(220) NOT NULL,
	`sourceText` text NOT NULL,
	`sourceLanguage` varchar(10) NOT NULL DEFAULT 'ar',
	`targetLanguage` varchar(10) NOT NULL,
	`translatedText` text,
	`context` varchar(180),
	`status` enum('untranslated','draft','published','ignored') NOT NULL DEFAULT 'untranslated',
	`occurrenceCount` int NOT NULL DEFAULT 1,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`createdByUserId` int,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uiTranslationEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `ui_translation_key_target_unique` UNIQUE(`translationKey`,`targetLanguage`)
);
--> statement-breakpoint
ALTER TABLE `uiTranslationEntries` ADD CONSTRAINT `uiTranslationEntries_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uiTranslationEntries` ADD CONSTRAINT `uiTranslationEntries_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ui_translation_status_idx` ON `uiTranslationEntries` (`status`,`targetLanguage`);