// backend/src/config/db.postgres.js
import pkg from "pg";
const { Pool } = pkg;

export const pgPool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  port: process.env.PG_PORT || 5432,
});

pgPool
  .connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.log("❌ PostgreSQL Error:", err));
