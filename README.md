# BookStore

A Node.js/Express backend for an online bookstore — user auth, book catalog, and order placement with async PDF receipt generation (Puppeteer + BullMQ).

## Tech Stack

- **Runtime:** Node.js 20, Express 5
- **Database:** MySQL 8 (`mysql2`)
- **Queue/Jobs:** BullMQ + Redis (receipt PDF generation runs in a background worker)
- **PDF Generation:** Puppeteer
- **Auth:** JWT (access + refresh tokens), bcrypt for password hashing
- **Containerization:** Docker Compose (`app`, `worker`, `mysql`, `redis`)

## Project Structure

```
src/
  config/       # DB and Redis connection setup
  controllers/  # Express route handlers
  services/     # Business logic
  models/       # DB queries
  routes/       # Express routers
  middleware/   # Auth middleware
  queues/       # BullMQ queue definitions
  workers/      # BullMQ workers (receipt generation)
  templates/    # HTML templates rendered to PDF
  sql/          # Table creation scripts
  utils/        # JWT helpers, etc.
```

## Environment Variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=bookstore
DB_PORT=3306

PORT=3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

`.env` is git-ignored — never commit real secrets.

## Running with Docker (Recommended)

This spins up the API, background worker, MySQL, and Redis together.

### 1. Build and start all services

```bash
docker compose up -d --build
```

This starts:
| Service  | Purpose                          | Host Port |
|----------|-----------------------------------|-----------|
| `app`    | Express API                       | 3000      |
| `worker` | BullMQ worker (receipt PDFs)      | —         |
| `mysql`  | MySQL 8 database                  | 3307 → 3306 |
| `redis`  | Redis (queue backend)             | 6379      |

> MySQL is mapped to host port **3307** (not 3306) to avoid clashing with a local MySQL install. Inside the Docker network, `app`/`worker` connect to it as `mysql:3306`.

### 2. Run the database migrations

The tables aren't created automatically — run each `.sql` file in `src/sql/` against the `bookstore` database once the `mysql` container is up:

```bash
docker compose exec -T mysql mysql -u root -p"$DB_PASSWORD" bookstore < src/sql/book.table.sql
docker compose exec -T mysql mysql -u root -p"$DB_PASSWORD" bookstore < src/sql/order.table.sql
docker compose exec -T mysql mysql -u root -p"$DB_PASSWORD" bookstore < src/sql/bank.table.sql
docker compose exec -T mysql mysql -u root -p"$DB_PASSWORD" bookstore < src/sql/refresh_tokens.table.sql
```

(You'll also need a `users` table — create one matching what `src/models/user.model.js` expects: `id`, `name`, `email`, `password`.)

If a table already exists from an earlier version and needs a new column (e.g. `orders.deliveryCharge`), check the bottom of the relevant `.sql` file for an `ALTER TABLE` statement to run instead.

### 3. Verify everything is up

```bash
docker compose ps
docker compose logs app --tail=20
docker compose logs worker --tail=20
```

### 4. Rebuilding after code changes

Containers run from a built image, not a live mount of `src/` — code changes on disk require a rebuild to take effect:

```bash
docker compose up -d --build --force-recreate app worker
```

### 5. Connecting a DB GUI (DBeaver / MySQL Workbench)

- Host: `127.0.0.1`
- Port: `3307`
- User: `root`
- Password: value of `DB_PASSWORD` in `.env`
- Database: `bookstore`

If you see `Public Key Retrieval is not allowed`, add the driver property `allowPublicKeyRetrieval=true` (MySQL 8's default auth plugin needs it over a non-SSL connection).

### 6. Viewing generated receipts

Generated PDF receipts are bind-mounted to `./receipts` in the project root — open them directly with any PDF viewer, no container access needed.

## Running Locally (without Docker)

Requires a local MySQL and Redis instance running, matching the `.env` config.

```bash
npm install
npm run dev        # starts the API with nodemon
node src/workers/receipt.worker.js   # in a separate terminal, starts the receipt worker
```

## Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| `ECONNREFUSED` on app/worker startup | MySQL container not fully ready yet | Wait a few seconds and restart the service, or add a healthcheck-based `depends_on` |
| `BullMQ: Your redis options maxRetriesPerRequest must be null` | ioredis connection missing that option | Already set in `src/config/redisConfig.js` — rebuild if you see this on an old image |
| `Could not find Chrome` in worker logs | Puppeteer's Chromium download didn't complete during image build | Rebuild the image (`docker compose up -d --build worker`); the Dockerfile explicitly runs `npx puppeteer browsers install chrome` |
| Address already in use on port 3306 | A local MySQL service is also running | Either stop the local service (`sudo systemctl stop mysql`) or keep the Docker container on its remapped port (3307) |
| PDF colors/backgrounds missing | Puppeteer doesn't print backgrounds by default | `printBackground: true` is set in `receipt.worker.js`'s `page.pdf()` call |

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/user/register` | No | Register a new user |
| POST | `/api/user/login` | No | Login, returns access + refresh tokens |
| POST | `/api/user/refresh-token` | No | Refresh access token |
| POST | `/api/user/logout` | No | Logout |
| GET | `/api/user/:email` | Yes | Get user by email |
| POST | `/api/book` | Yes | Create a book |
| GET | `/api/book` | Yes | List books |
| GET | `/api/book/:id` | Yes | Get a book |
| PUT | `/api/book/:id` | Yes | Update a book |
| DELETE | `/api/book/:id` | Yes | Delete a book |
| POST | `/api/order/createOrder` | Yes | Place an order (triggers async receipt generation) |
| GET | `/api/order/getOrderById/:orderId` | Yes | Get an order with its items |

### Create Order payload

```json
{
  "items": [
    { "bookId": 1, "quantity": 2 }
  ],
  "paymentMethod": "cash on delivery",
  "shippingAddress": "123 Main St, Springfield",
  "billingAddress": "123 Main St, Springfield",
  "deliveryCharge": 50
}
```

`priceAtPurchase`/`discountAtPurchase` are always computed server-side from the book's current `price`/`mrp` — never trust client-supplied pricing. `deliveryCharge` is optional (defaults to 0).