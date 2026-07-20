-- AlterTable
ALTER TABLE "Meditation" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Meditation_ownerId_isFavorite_idx" ON "Meditation"("ownerId", "isFavorite");
