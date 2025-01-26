/*
  Warnings:

  - You are about to drop the column `blogAuthor` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `blogDescription` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `blogTitle` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `bookmarkableId` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `bookmarkableType` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `courseDescription` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `courseLink` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `courseName` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `courseRating` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `courseThumbnail` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `courseWorkload` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `playlistChannel` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `playlistThumbnail` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `playlistTitle` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchCourses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[blogLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseraLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[udemyLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playlistLink]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "bookmark_blog_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "bookmark_course_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "bookmark_playlist_fkey";

-- DropForeignKey
ALTER TABLE "_SearchCourses" DROP CONSTRAINT "_SearchCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchCourses" DROP CONSTRAINT "_SearchCourses_B_fkey";

-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "blogAuthor",
DROP COLUMN "blogDescription",
DROP COLUMN "blogTitle",
DROP COLUMN "bookmarkableId",
DROP COLUMN "bookmarkableType",
DROP COLUMN "courseDescription",
DROP COLUMN "courseLink",
DROP COLUMN "courseName",
DROP COLUMN "courseRating",
DROP COLUMN "courseThumbnail",
DROP COLUMN "courseWorkload",
DROP COLUMN "playlistChannel",
DROP COLUMN "playlistThumbnail",
DROP COLUMN "playlistTitle",
ADD COLUMN     "courseraLink" TEXT,
ADD COLUMN     "udemyLink" TEXT;

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "_SearchCourses";

-- CreateTable
CREATE TABLE "Courseracourse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationLink" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "workload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Courseracourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Udemycourse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationLink" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Udemycourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SearchCourseraCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SearchCourseraCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SearchUdemyCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SearchUdemyCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courseracourse_registrationLink_key" ON "Courseracourse"("registrationLink");

-- CreateIndex
CREATE UNIQUE INDEX "Udemycourse_registrationLink_key" ON "Udemycourse"("registrationLink");

-- CreateIndex
CREATE INDEX "_SearchCourseraCourses_B_index" ON "_SearchCourseraCourses"("B");

-- CreateIndex
CREATE INDEX "_SearchUdemyCourses_B_index" ON "_SearchUdemyCourses"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_blogLink_key" ON "Bookmark"("blogLink");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_courseraLink_key" ON "Bookmark"("courseraLink");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_udemyLink_key" ON "Bookmark"("udemyLink");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_playlistLink_key" ON "Bookmark"("playlistLink");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_blog_fkey" FOREIGN KEY ("blogLink") REFERENCES "Blog"("link") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_coursera_fkey" FOREIGN KEY ("courseraLink") REFERENCES "Courseracourse"("registrationLink") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_udemy_fkey" FOREIGN KEY ("udemyLink") REFERENCES "Udemycourse"("registrationLink") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_playlist_fkey" FOREIGN KEY ("playlistLink") REFERENCES "Playlist"("link") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchCourseraCourses" ADD CONSTRAINT "_SearchCourseraCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Courseracourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchCourseraCourses" ADD CONSTRAINT "_SearchCourseraCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Search"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchUdemyCourses" ADD CONSTRAINT "_SearchUdemyCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Search"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchUdemyCourses" ADD CONSTRAINT "_SearchUdemyCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Udemycourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
