/*
  Warnings:

  - You are about to drop the `Search` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchBlogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchCourseraCourses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchPlaylists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchUdemyCourses` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `query` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `Courseracourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `Udemycourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Search" DROP CONSTRAINT "Search_userId_fkey";

-- DropForeignKey
ALTER TABLE "_SearchBlogs" DROP CONSTRAINT "_SearchBlogs_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchBlogs" DROP CONSTRAINT "_SearchBlogs_B_fkey";

-- DropForeignKey
ALTER TABLE "_SearchCourseraCourses" DROP CONSTRAINT "_SearchCourseraCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchCourseraCourses" DROP CONSTRAINT "_SearchCourseraCourses_B_fkey";

-- DropForeignKey
ALTER TABLE "_SearchPlaylists" DROP CONSTRAINT "_SearchPlaylists_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchPlaylists" DROP CONSTRAINT "_SearchPlaylists_B_fkey";

-- DropForeignKey
ALTER TABLE "_SearchUdemyCourses" DROP CONSTRAINT "_SearchUdemyCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchUdemyCourses" DROP CONSTRAINT "_SearchUdemyCourses_B_fkey";

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "query" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Courseracourse" ADD COLUMN     "query" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "query" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Udemycourse" ADD COLUMN     "query" TEXT NOT NULL;

-- DropTable
DROP TABLE "Search";

-- DropTable
DROP TABLE "_SearchBlogs";

-- DropTable
DROP TABLE "_SearchCourseraCourses";

-- DropTable
DROP TABLE "_SearchPlaylists";

-- DropTable
DROP TABLE "_SearchUdemyCourses";
