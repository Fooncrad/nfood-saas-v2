ALTER TABLE `restaurants` ADD `primaryLanguage` varchar(10) DEFAULT 'ar' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `timezone` varchar(64) DEFAULT 'Asia/Riyadh' NOT NULL;