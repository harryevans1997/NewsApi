import { query } from "../index.mjs";
import { pool } from "../index.mjs";

export default async function dropTable() {
  const sqlString = `DROP TABLE IF EXISTS articles;`;
  const result = await query(sqlString);
  console.log("Table dropped");
}

(async () => {
  const client = await pool.connect();
  try {
    const time = await pool.query(`SELECT NOW()`);
    console.log(time.rows);
    dropTable();
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
  }
})().catch((err) => console.log(err.stack));
