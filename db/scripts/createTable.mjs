import { query } from "../index.mjs";
import { pool } from "../index.mjs";

export default async function createTable() {
  const sqlString = `CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    url text,
    source text
);`;
  const result = await query(sqlString);
  console.log("Table created");
}

(async () => {
  const client = await pool.connect();
  try {
    const time = await pool.query(`SELECT NOW()`);
    console.log(time.rows);
    createTable();
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
  }
})().catch((err) => console.log(err.stack));
