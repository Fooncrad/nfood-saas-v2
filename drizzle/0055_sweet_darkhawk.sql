ALTER TABLE `deliveryZones` ADD `polygonJson` text;--> statement-breakpoint
ALTER TABLE `reservationSlots` ADD `bookedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `slotId` int;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_slotId_reservationSlots_id_fk` FOREIGN KEY (`slotId`) REFERENCES `reservationSlots`(`id`) ON DELETE no action ON UPDATE no action;