/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `Blog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registrationLink]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Blog_link_key" ON "Blog"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Course_registrationLink_key" ON "Course"("registrationLink");
