ALTER TABLE `site_daily_page_views` DROP INDEX `site_daily_page_views_date_visitor_path_unique`;--> statement-breakpoint
ALTER TABLE `site_daily_visits` DROP INDEX `site_daily_visits_date_visitor_unique`;--> statement-breakpoint
ALTER TABLE `site_daily_page_views` ADD `trafficSource` enum('website','apk','unknown') DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_daily_visits` ADD `trafficSource` enum('website','apk','unknown') DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_daily_page_views` ADD CONSTRAINT `site_daily_page_views_date_visitor_path_unique` UNIQUE(`visitDate`,`visitorId`,`path`,`trafficSource`);--> statement-breakpoint
ALTER TABLE `site_daily_visits` ADD CONSTRAINT `site_daily_visits_date_visitor_unique` UNIQUE(`visitDate`,`visitorId`,`trafficSource`);