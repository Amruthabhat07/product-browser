const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Sports",
  "Home"
];

async function main() {

  const batchSize = 5000;
  const total = 200000;

  for (let start = 0; start < total; start += batchSize) {

    const products = [];

    for (let i = 0; i < batchSize; i++) {

      const n = start + i;

      products.push({
        name: `Product ${n}`,
        category:
          categories[Math.floor(Math.random() * categories.length)],
        price:
          +(Math.random() * 1000).toFixed(2)
      });
    }

    await prisma.product.createMany({
      data: products
    });

    console.log(
      `Inserted ${Math.min(start + batchSize, total)}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());