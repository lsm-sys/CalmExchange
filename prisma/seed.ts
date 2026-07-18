import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@calmexchange.local" },
    update: {},
    create: {
      email: "seed@calmexchange.local",
      name: "Seed User",
    },
  });

  await prisma.note.createMany({
    data: [
      { ownerId: user.id, title: "Первая заметка из seed" },
      { ownerId: user.id, title: "Вторая заметка из seed" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
