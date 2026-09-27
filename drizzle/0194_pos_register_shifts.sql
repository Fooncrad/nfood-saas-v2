CREATE TABLE IF NOT EXISTS `posRegisters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurantId` int NOT NULL,
  `branchId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `deviceKey` varchar(128) NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pos_registers_branch_name_unique` (`branchId`, `name`),
  KEY `pos_registers_restaurant_branch_idx` (`restaurantId`, `branchId`),
  CONSTRAINT `pos_registers_restaurant_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`),
  CONSTRAINT `pos_registers_branch_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`)
);

CREATE TABLE IF NOT EXISTS `posShifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registerId` int NOT NULL,
  `restaurantId` int NOT NULL,
  `branchId` int NOT NULL,
  `cashierUserId` int NOT NULL,
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `openingCash` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expectedCash` decimal(12,2) NOT NULL DEFAULT 0.00,
  `countedCash` decimal(12,2) NULL,
  `varianceAmount` decimal(12,2) NULL,
  `openedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closedAt` timestamp NULL,
  `closedByUserId` int NULL,
  `note` varchar(500) NULL,
  PRIMARY KEY (`id`),
  KEY `pos_shifts_register_status_idx` (`registerId`, `status`),
  KEY `pos_shifts_cashier_status_idx` (`cashierUserId`, `status`),
  CONSTRAINT `pos_shifts_register_fk` FOREIGN KEY (`registerId`) REFERENCES `posRegisters`(`id`),
  CONSTRAINT `pos_shifts_restaurant_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`),
  CONSTRAINT `pos_shifts_branch_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`),
  CONSTRAINT `pos_shifts_cashier_fk` FOREIGN KEY (`cashierUserId`) REFERENCES `users`(`id`),
  CONSTRAINT `pos_shifts_closed_by_fk` FOREIGN KEY (`closedByUserId`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `posCashMovements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shiftId` int NOT NULL,
  `restaurantId` int NOT NULL,
  `branchId` int NOT NULL,
  `type` enum('cash_in','cash_out') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` varchar(300) NOT NULL,
  `createdByUserId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pos_cash_movements_shift_date_idx` (`shiftId`, `createdAt`),
  CONSTRAINT `pos_cash_movements_shift_fk` FOREIGN KEY (`shiftId`) REFERENCES `posShifts`(`id`),
  CONSTRAINT `pos_cash_movements_restaurant_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`),
  CONSTRAINT `pos_cash_movements_branch_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`),
  CONSTRAINT `pos_cash_movements_created_by_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`)
);