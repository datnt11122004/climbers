-- CreateTable
CREATE TABLE "telegram_users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255),
    "telegram_id" BIGINT NOT NULL,
    "language" TEXT DEFAULT 'en',
    "private_chat_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bots" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "interactive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "icon" VARCHAR(50),
    "color" VARCHAR(30),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_category_follows" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_category_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_telegram_id_key" ON "telegram_users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_name_key" ON "bots"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bots_token_key" ON "bots"("token");

-- CreateIndex
CREATE UNIQUE INDEX "app_categories_name_key" ON "app_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "app_categories_slug_key" ON "app_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_category_follows_user_id_category_id_key" ON "user_category_follows"("user_id", "category_id");

-- AddForeignKey
ALTER TABLE "user_category_follows" ADD CONSTRAINT "user_category_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category_follows" ADD CONSTRAINT "user_category_follows_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "app_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
