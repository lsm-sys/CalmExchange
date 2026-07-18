import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "test@calmexchange.local" },
    update: { name: "Тестовый пользователь" },
    create: {
      email: "test@calmexchange.local",
      name: "Тестовый пользователь",
    },
  });

  const meditation = await prisma.meditation.upsert({
    where: { id: "verify-test-meditation" },
    update: {
      title: "Тестовая медитация",
      content: "Тестовый промт: спокойное дыхание 4-4-4.",
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
    create: {
      id: "verify-test-meditation",
      ownerId: user.id,
      title: "Тестовая медитация",
      content: "Тестовый промт: спокойное дыхание 4-4-4.",
      description: "Проверочная публичная медитация",
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
  });

  const vote = await prisma.vote.upsert({
    where: {
      userId_meditationId: {
        userId: user.id,
        meditationId: meditation.id,
      },
    },
    update: { value: 1 },
    create: {
      userId: user.id,
      meditationId: meditation.id,
      value: 1,
    },
  });

  console.log("OK: проверка пройдена");
  console.log(`  user:       ${user.email} (${user.id})`);
  console.log(`  meditation: ${meditation.title} (${meditation.id})`);
  console.log(`  vote:       value=${vote.value} (${vote.id})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("FAIL:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
