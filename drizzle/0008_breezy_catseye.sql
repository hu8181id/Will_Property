CREATE TABLE `site_daily_page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitDate` varchar(10) NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`contentType` enum('page','listing') NOT NULL,
	`path` varchar(256) NOT NULL,
	`contentTitle` varchar(255) NOT NULL,
	`propertyId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_daily_page_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_daily_page_views_date_visitor_path_unique` UNIQUE(`visitDate`,`visitorId`,`path`)
);
--> statement-breakpoint
CREATE INDEX `site_daily_page_views_visit_date_idx` ON `site_daily_page_views` (`visitDate`);--> statement-breakpoint
CREATE INDEX `site_daily_page_views_content_date_idx` ON `site_daily_page_views` (`contentType`,`visitDate`);