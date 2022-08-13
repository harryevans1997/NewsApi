import { query } from "../index.mjs";
import { pool } from "../index.mjs";
import { articles } from "../../index.js";

export default async function populateTable() {
  articles.forEach(async (article) => {
    const result = await query(
      `INSERT INTO articles(title, url, source) VALUES ($1, $2, $3) RETURNING *;`,
      [article.title, article.url, article.source]
    );
    console.log(`${article.title} added to DB`);
  });
}

(async () => {
  const client = await pool.connect();
  try {
    const time = await pool.query(`SELECT NOW()`);
    console.log(time.rows);
    populateTable();
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
  }
})().catch((err) => console.log(err.stack));
