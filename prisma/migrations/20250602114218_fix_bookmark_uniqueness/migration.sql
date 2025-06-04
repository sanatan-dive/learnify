/*
  Warnings:

  - A unique constraint covering the columns `[userId,blogLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,courseraLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,udemyLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,playlistLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_blogLink_key" ON "Bookmark"("userId", "blogLink");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_courseraLink_key" ON "Bookmark"("userId", "courseraLink");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_udemyLink_key" ON "Bookmark"("userId", "udemyLink");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_playlistLink_key" ON "Bookmark"("userId", "playlistLink");
