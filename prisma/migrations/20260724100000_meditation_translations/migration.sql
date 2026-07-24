-- AlterTable
ALTER TABLE "Meditation" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'ru';

-- CreateTable
CREATE TABLE "MeditationTranslation" (
    "id" TEXT NOT NULL,
    "meditationId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeditationTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeditationTranslation_meditationId_locale_key" ON "MeditationTranslation"("meditationId", "locale");

-- CreateIndex
CREATE INDEX "MeditationTranslation_locale_idx" ON "MeditationTranslation"("locale");

-- AddForeignKey
ALTER TABLE "MeditationTranslation" ADD CONSTRAINT "MeditationTranslation_meditationId_fkey" FOREIGN KEY ("meditationId") REFERENCES "Meditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Перенос существующего контента в ru-переводы
INSERT INTO "MeditationTranslation" ("id", "meditationId", "locale", "title", "content", "updatedAt")
SELECT
    'mtr_' || substr(md5("id" || random()::text), 1, 24),
    "id",
    'ru',
    "title",
    "content",
    NOW()
FROM "Meditation";
