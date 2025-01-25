/*
  Warnings:

  - You are about to drop the column `blogId` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the `ApiResponse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bookmarkableId` to the `Bookmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookmarkableType` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "blogId",
ADD COLUMN     "blogAuthor" TEXT,
ADD COLUMN     "blogDescription" TEXT,
ADD COLUMN     "blogLink" TEXT,
ADD COLUMN     "blogTitle" TEXT,
ADD COLUMN     "bookmarkableId" TEXT NOT NULL,
ADD COLUMN     "bookmarkableType" TEXT NOT NULL,
ADD COLUMN     "courseDescription" TEXT,
ADD COLUMN     "courseLink" TEXT,
ADD COLUMN     "courseName" TEXT,
ADD COLUMN     "courseRating" DOUBLE PRECISION,
ADD COLUMN     "courseThumbnail" TEXT,
ADD COLUMN     "courseWorkload" TEXT,
ADD COLUMN     "playlistChannel" TEXT,
ADD COLUMN     "playlistLink" TEXT,
ADD COLUMN     "playlistThumbnail" TEXT,
ADD COLUMN     "playlistTitle" TEXT;

-- DropTable
DROP TABLE "ApiResponse";

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "author" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationLink" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "workload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_blog_fkey" FOREIGN KEY ("bookmarkableId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_course_fkey" FOREIGN KEY ("bookmarkableId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "bookmark_playlist_fkey" FOREIGN KEY ("bookmarkableId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
