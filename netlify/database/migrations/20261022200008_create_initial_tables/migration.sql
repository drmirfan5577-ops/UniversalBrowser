CREATE TABLE "launchers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"icon_emoji" text NOT NULL,
	"hub_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"gradient" text NOT NULL,
	"accent_color" text NOT NULL,
	"card_bg" text NOT NULL,
	"is_built_in" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticker_messages" (
	"id" serial PRIMARY KEY,
	"content" text NOT NULL,
	"strip" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
