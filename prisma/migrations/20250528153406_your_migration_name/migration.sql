-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "timeframe" INTEGER NOT NULL,
    "experience" TEXT NOT NULL,
    "focus" JSONB,
    "roadmapData" JSONB NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Roadmap_userId_createdAt_idx" ON "Roadmap"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
