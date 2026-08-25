ALTER TABLE `restaurants` ADD `menuTemplateScheduleJson` text;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `menuTemplateScheduleTimezone` varchar(64) DEFAULT 'Asia/Riyadh' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `menuTemplateScheduleCronTaskUid` varchar(65);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `glassGlowColor` varchar(7) DEFAULT '#F97316' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `glassCardOpacity` decimal(3,2) DEFAULT '0.10' NOT NULL;--> statement-breakpoint
CREATE INDEX `restaurants_menu_template_schedule_task_idx` ON `restaurants` (`menuTemplateScheduleCronTaskUid`);