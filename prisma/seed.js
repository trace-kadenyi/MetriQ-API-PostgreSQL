const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const user = await prisma.user.create({
    data: {
      provider: "google",
      providerId: "seed-google-id-001",
      email: "trace@example.com",
      name: "Trace",
      avatar: "https://avatars.example.com/trace.png",
      theme: "dark",
    },
  });

  const [googleUrl, githubUrl, endevioUrl, wikipediaUrl] = await Promise.all([
    prisma.url.create({ data: { url: "https://google.com" } }),
    prisma.url.create({ data: { url: "https://github.com" } }),
    prisma.url.create({ data: { url: "https://www.endevio.com" } }),
    prisma.url.create({ data: { url: "https://wikipedia.org" } }),
  ]);

  await prisma.report.createMany({
    data: [
      { urlId: googleUrl.id, rawData: { mobile: { score: 85 }, desktop: { score: 96 } } },
      { urlId: githubUrl.id, rawData: { mobile: { score: 78 }, desktop: { score: 91 } } },
      { urlId: endevioUrl.id, rawData: { mobile: { score: 70 }, desktop: { score: 88 } } },
    ],
  });

  await prisma.favourite.createMany({
    data: [
      { anonId: "anon-session-001", urlId: googleUrl.id },
      { anonId: "anon-session-001", urlId: githubUrl.id },
      { anonId: "anon-session-002", urlId: wikipediaUrl.id },
    ],
  });

  const comparison = await prisma.comparison.create({
    data: {
      anonId: "anon-session-001",
      userSiteUrl: "https://www.endevio.com",
      userScores: { mobile: { score: 70 }, desktop: { score: 88 } },
      competitors: {
        create: [
          { urlId: googleUrl.id, label: "Google", scores: { mobile: { score: 85 }, desktop: { score: 96 } }, error: false },
          { urlId: githubUrl.id, label: "GitHub", scores: { mobile: { score: 78 }, desktop: { score: 91 } }, error: false },
        ],
      },
    },
    include: { competitors: true },
  });

  console.log("✅ Seeded:", {
    user: user.id,
    urls: [googleUrl.id, githubUrl.id, endevioUrl.id, wikipediaUrl.id],
    comparison: comparison.id,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });