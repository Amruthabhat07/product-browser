# Product Browser Backend

Backend service for browsing a large product catalog (~200,000 products) with fast pagination, category filtering, and consistent results while data is changing.

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* Neon Database
* Render (deployment)

---

## Problem Statement

Build a backend that allows users to:

* Browse ~200,000 products
* View newest products first
* Filter products by category
* Paginate efficiently
* Avoid duplicates or missing products while data is being inserted or updated

---

## Database Schema

### Product

| Field     | Type     |
| --------- | -------- |
| id        | UUID     |
| name      | String   |
| category  | String   |
| price     | Float    |
| createdAt | DateTime |
| updatedAt | DateTime |

### Index

A composite index is used for efficient pagination:

```prisma
@@index([updatedAt(sort: Desc), id(sort: Desc)])
```

This supports:

```sql
ORDER BY updatedAt DESC, id DESC
```

without requiring expensive full-table scans.

---

## Data Generation

A seed script generates 200,000 products.

To avoid slow row-by-row inserts, products are generated in memory and inserted using Prisma's `createMany()` in batches.

This significantly reduces database round trips and seed time.

Run:

```bash
npx prisma db seed
```

---

## API Endpoints

### Get Products

```http
GET /products
```

Returns first page of products.

Optional query parameters:

```http
GET /products?category=Books

GET /products?limit=50

GET /products?cursorUpdatedAt=...
&cursorId=...
&snapshotTime=...
```

### Example Response

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Product 1",
      "category": "Books",
      "price": 499.99,
      "createdAt": "2026-06-23T09:00:00.000Z",
      "updatedAt": "2026-06-23T09:00:00.000Z"
    }
  ],
  "nextCursor": {
    "updatedAt": "2026-06-23T09:00:00.000Z",
    "id": "uuid"
  },
  "snapshotTime": "2026-06-23T09:00:00.000Z"
}
```

---

### Get Categories

```http
GET /products/categories
```

Returns all available product categories.

---

### Health Check

```http
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

---

## Pagination Strategy

### Why Not OFFSET Pagination?

A common approach is:

```sql
LIMIT 20 OFFSET 100000
```

Problems:

* Performance degrades as offset increases
* Database must scan and discard rows
* New inserts or updates can cause duplicates and missing records

---

## Cursor Pagination

This project uses keyset (cursor) pagination.

Products are ordered by:

```sql
updatedAt DESC,
id DESC
```

Cursor consists of:

```json
{
  "updatedAt": "...",
  "id": "..."
}
```

The next page fetches products after the last seen record.

Benefits:

* Consistent performance
* Index-friendly queries
* No offset scanning

---

## Handling Concurrent Updates

The assignment requires:

> Users must not see duplicate products or miss products if new products are added or updated while browsing.

To achieve this, snapshot pagination is used.

### Snapshot Time

When the first page is requested:

```text
snapshotTime = current timestamp
```

This timestamp is returned to the client.

Every subsequent request includes the same snapshot time:

```http
GET /products?snapshotTime=...
```

Only products with:

```sql
updatedAt <= snapshotTime
```

are included.

This creates a stable view of the dataset for the duration of the browsing session.

Benefits:

* No duplicates
* No missing products
* Consistent ordering
* Correct behavior under inserts and updates

---

## Running Locally

Install dependencies:

```bash
npm install
```

Configure environment variables:

```env
DATABASE_URL=YOUR_DATABASE_URL
```

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed database:

```bash
npx prisma db seed
```

Start server:

```bash
node src/server.js
```

Server runs on:

```text
http://localhost:3000
```

---

## Deployment

### Backend

Hosted on Render.

Deployment URL:

```text
PASTE_RENDER_URL_HERE
```

### Database

Hosted on Neon.

---

## Future Improvements

Possible enhancements include:

* Full-text product search
* Category statistics endpoint
* Redis caching
* Rate limiting
* OpenAPI / Swagger documentation
* Automated tests
* Infinite scrolling frontend
* Docker containerization
* Monitoring and logging

---

## Design Decisions Summary

* PostgreSQL chosen for efficient indexed ordering and filtering.
* Prisma chosen for developer productivity and schema management.
* Batch inserts used for fast data generation.
* Composite index used for efficient pagination.
* Cursor pagination used instead of OFFSET pagination.
* Snapshot-based browsing implemented to ensure correctness while data changes.

These decisions prioritize correctness, scalability, and performance for large datasets.
