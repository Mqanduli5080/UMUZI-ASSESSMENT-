// Seed a few example brews
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.brew.createMany({
    data: [
      {
        method: 'Pour Over',
        beans: 'Ethiopia Yirgacheffe',
        dose: 18,
        yield: 300,
        time: 180,
        notes: 'Floral and bright'
      },
      {
        method: 'French Press',
        beans: 'Colombia Supremo',
        dose: 30,
        yield: 500,
        time: 240,
        notes: 'Round body, chocolate notes'
      }
    ],
    skipDuplicates: true
  });

  console.log('Seeding done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
