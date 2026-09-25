ALTER TABLE `restaurants` MODIFY COLUMN `menuTemplate` enum('editorial','bistro','glass','customer','market','signature') NOT NULL DEFAULT 'editorial';
