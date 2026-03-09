-- CreateEnum
CREATE TYPE "Store" AS ENUM ('PLAY', 'IOS');

-- CreateEnum
CREATE TYPE "CrawlStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('NT1', 'NT2');

-- CreateTable
CREATE TABLE "tracked_apps" (
    "id" SERIAL NOT NULL,
    "app_id" VARCHAR(255) NOT NULL,
    "store" "Store" NOT NULL DEFAULT 'PLAY',
    "name" VARCHAR(500) NOT NULL,
    "category" VARCHAR(100),
    "icon" VARCHAR(1000),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracked_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_daily_data" (
    "id" SERIAL NOT NULL,
    "tracked_app_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "rating_count" INTEGER,
    "rating_value" DOUBLE PRECISION,
    "version" VARCHAR(50),
    "updated_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_daily_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_trigger_alerts" (
    "id" SERIAL NOT NULL,
    "tracked_app_id" INTEGER NOT NULL,
    "trigger_date" DATE NOT NULL,
    "trigger_type" "TriggerType" NOT NULL,
    "d0_downloads" INTEGER NOT NULL,
    "d1_downloads" INTEGER NOT NULL,
    "d2_downloads" INTEGER NOT NULL,
    "growth_rate" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_trigger_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawl_logs" (
    "id" SERIAL NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "status" "CrawlStatus" NOT NULL DEFAULT 'RUNNING',
    "total_apps" INTEGER NOT NULL DEFAULT 0,
    "processed_apps" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawl_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracked_apps_app_id_store_key" ON "tracked_apps"("app_id", "store");

-- CreateIndex
CREATE UNIQUE INDEX "app_daily_data_tracked_app_id_date_key" ON "app_daily_data"("tracked_app_id", "date");

-- AddForeignKey
ALTER TABLE "app_daily_data" ADD CONSTRAINT "app_daily_data_tracked_app_id_fkey" FOREIGN KEY ("tracked_app_id") REFERENCES "tracked_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_trigger_alerts" ADD CONSTRAINT "app_trigger_alerts_tracked_app_id_fkey" FOREIGN KEY ("tracked_app_id") REFERENCES "tracked_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
