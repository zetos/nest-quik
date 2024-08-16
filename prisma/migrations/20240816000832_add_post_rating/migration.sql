/*
  Warnings:

  - You are about to drop the column `dislikes` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `posts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "postRating" AS ENUM ('like', 'dislike');

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "dislikes",
DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "postRates" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "rating" "postRating" NOT NULL,

    CONSTRAINT "postRates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postRates_userId_postId_key" ON "postRates"("userId", "postId");

-- AddForeignKey
ALTER TABLE "postRates" ADD CONSTRAINT "postRates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postRates" ADD CONSTRAINT "postRates_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
