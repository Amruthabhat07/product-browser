const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = req.query.category;

    const cursorUpdatedAt = req.query.cursorUpdatedAt;
    const cursorId = req.query.cursorId;

    const snapshotTime =
      req.query.snapshotTime || new Date().toISOString();

    let where = {
      updatedAt: {
        lte: new Date(snapshotTime)
      }
    };

    if (category) {
      where.category = category;
    }

    if (cursorUpdatedAt && cursorId) {
      where = {
        ...where,
        AND: [
          {
            OR: [
              {
                updatedAt: {
                  lt: new Date(cursorUpdatedAt)
                }
              },
              {
                updatedAt: new Date(cursorUpdatedAt),
                id: {
                  lt: cursorId
                }
              }
            ]
          }
        ]
      };
    }

    const products = await prisma.product.findMany({
      where,
      take: 20,
      orderBy: [
        { updatedAt: "desc" },
        { id: "desc" }
      ]
    });

    const lastProduct = products[products.length - 1];

    const nextCursor = lastProduct
      ? {
          updatedAt: lastProduct.updatedAt,
          id: lastProduct.id
        }
      : null;

    res.json({
      items: products,
      nextCursor,
      snapshotTime
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      distinct: ["category"],
      select: {
        category: true
      }
    });

    res.json(categories);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

module.exports = router;