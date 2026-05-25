// backend/src/db/client.ts
//
// WHAT  The single pg connection Pool for the whole process, plus an optional query()
//       helper.
// HOW   Import { pool } (or query) and run parameterized SQL: query("SELECT ... WHERE
//       id = $1", [id]). Always use $1/$2 placeholders — never string-concatenate user
//       input (SQL injection).
// WHY   A Pool reuses a fixed set of TCP connections across all requests. Opening a new
//       connection per request is slow and quickly exhausts Postgres's connection limit
//       under load — the opposite of "serve quickly at volume."
// ALTERNATIVES
//   - new Client() per request: simple but reconnects every time; doesn't scale.
//   - An ORM (Prisma/Drizzle): type-safe queries + migrations out of the box, at the
//     cost of a dependency and some opacity. Great for bigger schemas; raw pg keeps this
//     learning project's SQL visible.
//   - At very high instance counts, front the Pool with an external pooler (PgBouncer /
//     Neon pooled endpoint) so many app instances don't overwhelm Postgres.
//
// TODO:
//   - import { Pool } from "pg"
//   - import { env } from "../config/env"
//   - export const pool = new Pool({ connectionString: env.DATABASE_URL })
//   - (optional) export a small query<T>(text, params) helper for convenience

import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
