CREATE TABLE `property_video_upload_sessions` (
	`id` varchar(64) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`contentType` varchar(128) NOT NULL,
	`totalBytes` int NOT NULL,
	`totalChunks` int NOT NULL,
	`chunkKeys` json NOT NULL,
	`completedUrl` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_video_upload_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `property_video_upload_sessions_created_at_idx` ON `property_video_upload_sessions` (`createdAt`);