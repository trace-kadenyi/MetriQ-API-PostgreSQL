-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urls" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourites" (
    "id" TEXT NOT NULL,
    "anonId" TEXT,
    "urlId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" TEXT NOT NULL,
    "anonId" TEXT,
    "userSiteUrl" TEXT NOT NULL,
    "userScores" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_urls" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "label" TEXT,
    "scores" JSONB,
    "error" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "comparison_urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_providerId_key" ON "users"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "urls_url_key" ON "urls"("url");

-- CreateIndex
CREATE INDEX "reports_urlId_idx" ON "reports"("urlId");

-- CreateIndex
CREATE INDEX "favourites_anonId_idx" ON "favourites"("anonId");

-- CreateIndex
CREATE UNIQUE INDEX "favourites_anonId_urlId_key" ON "favourites"("anonId", "urlId");

-- CreateIndex
CREATE INDEX "comparisons_anonId_idx" ON "comparisons"("anonId");

-- CreateIndex
CREATE INDEX "comparison_urls_comparisonId_idx" ON "comparison_urls"("comparisonId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_urls" ADD CONSTRAINT "comparison_urls_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_urls" ADD CONSTRAINT "comparison_urls_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "urls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
