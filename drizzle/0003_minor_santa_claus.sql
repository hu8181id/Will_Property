ALTER TABLE `property_reviews` ADD COLUMN `reviewStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending';
--> statement-breakpoint
CREATE INDEX `property_reviews_status_idx` ON `property_reviews` (`reviewStatus`);
