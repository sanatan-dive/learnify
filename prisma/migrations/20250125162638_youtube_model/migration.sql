/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Playlist_link_key" ON "Playlist"("link");
