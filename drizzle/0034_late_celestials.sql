CREATE TABLE `driverApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantUserId` int,
	`fullName` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`city` varchar(120) NOT NULL,
	`vehicleType` enum('bicycle','motorcycle','car','van','other') NOT NULL,
	`identityDocumentUrl` varchar(500),
	`licenseDocumentUrl` varchar(500),
	`vehicleFrontUrl` varchar(500),
	`vehicleBackUrl` varchar(500),
	`vehicleLeftUrl` varchar(500),
	`vehicleRightUrl` varchar(500),
	`status` enum('pending_review','approved','rejected') NOT NULL DEFAULT 'pending_review',
	`reviewNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driverApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `driverApplications` ADD CONSTRAINT `driverApplications_applicantUserId_users_id_fk` FOREIGN KEY (`applicantUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;