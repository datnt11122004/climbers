-- AlterEnum
ALTER TYPE "TriggerType" ADD VALUE 'NT3';

-- AlterTable
ALTER TABLE "tracked_apps" ADD COLUMN     "release_date" DATE;

-- CreateTable
CREATE TABLE "telegram_group_configs" (
    "id" SERIAL NOT NULL,
    "bot_id" INTEGER NOT NULL,
    "chat_id" VARCHAR(255) NOT NULL,
    "topic_id" INTEGER,
    "group_name" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_group_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_group_configs_bot_id_chat_id_topic_id_key" ON "telegram_group_configs"("bot_id", "chat_id", "topic_id");

-- AddForeignKey
ALTER TABLE "telegram_group_configs" ADD CONSTRAINT "telegram_group_configs_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
