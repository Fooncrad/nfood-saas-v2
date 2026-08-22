ALTER TABLE `reservations` ADD `assignedTableId` int;--> statement-breakpoint
ALTER TABLE `reservations` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `reservations` ADD `durationMinutes` int DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `noShowNotifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `reservationNoShowGraceMinutes` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_assignedTableId_restaurantTables_id_fk` FOREIGN KEY (`assignedTableId`) REFERENCES `restaurantTables`(`id`) ON DELETE no action ON UPDATE no action;