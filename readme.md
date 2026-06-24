#Product Browser Backend

A backend service for browsing a catalog of 200,000+ products with fast pagination, category filtering, and consistent results while data is changing.

Live Demo:

working Frontend link: https://appuct-browser-x9jjzdfwddpyphdkpj8guq.streamlit.app/

API: https://product-browser-l4gj.onrender.com

GitHub: https://github.com/Amruthabhat07/product-browser

Tech Stack:
Node.js
Express.js
PostgreSQL (Neon)
Prisma ORM
Render(deployment)

Features:
Browse 200,000+ products
Filter by category
Newest products first
Fast cursor-based pagination
Consistent results during concurrent inserts/updates
Seed script for generating large datasets

API Endpoints:
Get Products
GET /products

Optional query parameters:

GET /products?category=Books
GET /products?limit=50
GET /products?cursorUpdatedAt=...&cursorId=...&snapshotTime=...

Get Categories
GET /products/categories

Health Check
GET /health

Database Schema:
Product
Field Type
id	UUID
name String
category String
price Float
createdAt DateTime
updatedAt DateTime

Index
@@index([updatedAt(sort: Desc), id(sort: Desc)])
Key Design Decisions
Why Cursor Pagination?

Offset pagination becomes slower as data grows and can produce duplicates or missing records when new data is inserted.

This project uses cursor pagination based on:

(updatedAt, id)

which provides:

Consistent performance
Efficient index usage
Stable pagination
Why Snapshot Pagination?

When the first page is requested, a snapshotTime is generated and returned to the client.

Subsequent requests reuse the same snapshot:

updatedAt <= snapshotTime

This prevents duplicate or missing products during a browsing session.