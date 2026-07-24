-- AlterTable
ALTER TABLE "User" ADD COLUMN "autoTranslateConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "autoTranslateConsentAt" TIMESTAMP(3);
