CREATE TABLE `property_indexing_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`url` varchar(1000) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`lastError` text,
	`lastProcessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_indexing_queue_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_indexing_queue_property_id_unique` UNIQUE(`propertyId`)
);
--> statement-breakpoint
CREATE INDEX `property_indexing_queue_status_idx` ON `property_indexing_queue` (`status`);--> statement-breakpoint
CREATE INDEX `property_indexing_queue_updated_at_idx` ON `property_indexing_queue` (`updatedAt`);