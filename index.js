const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const newspapers = [
  {
    name: "The Wall Street Journal",
    address: "https://www.wsj.com/news/sports",
    base: "",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $("a > span", html).each(function () {
      const spanText = $(this).text().toLowerCase();
      if (spanText.includes("series")) {
        const title = $(this).text();
        const url = $(this).parents().attr("href");
        articles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name,
        });
      }
      if (spanText.includes("cup")) {
        const title = $(this).text();
        const url = $(this).parents().attr("href");
        articles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name,
        });
      }
      if (spanText.includes("coach")) {
        const title = $(this).text();
        const url = $(this).parents().attr("href");
        articles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name,
        });
      }
    });
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to my Sports News API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
