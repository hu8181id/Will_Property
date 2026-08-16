CREATE TABLE `site_daily_visits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitDate` varchar(10) NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_daily_visits_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_daily_visits_date_visitor_unique` UNIQUE(`visitDate`,`visitorId`)
);
--> statement-breakpoint
CREATE INDEX `site_daily_visits_visit_date_idx` ON `site_daily_visits` (`visitDate`);