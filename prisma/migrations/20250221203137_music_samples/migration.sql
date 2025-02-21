-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('BEAT', 'RADIO', 'FX');

-- CreateTable
CREATE TABLE "Sample" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "type" "SampleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isLoop" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);
