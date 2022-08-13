const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { sportsJargon } = require("./libs/keywords/sports");
const app = express();

const newspapers = [
  {
    name: "wsj",
    address: "https://www.wsj.com/news/sports",
    base: "",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      // searched each <a> and checks if the first child (and descendants) contains any of the sports keywords
      $("a > :first-child", html).each(function () {
        const spanText = $(this).text().toLowerCase();

        sportsJargon.forEach((word) => {
          if (spanText.includes(word)) {
            const title = $(this).text();
            const url = $(this).parents().attr("href");
            if (!articles.find((obj) => obj.title === title)) {
              articles.push({
                title,
                url: newspaper.base + url,
                source: newspaper.name,
              });
            }
          }
        });
      });
    })
    .catch((err) => console.log(err));
});

app.get("/", (req, res) => {
  res.json("Welcome to my Sports News API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const filteredArticles = [];

      $("a > :first-child", html).each(function () {
        const spanText = $(this).text().toLowerCase();
        sportsJargon.forEach((word) => {
          if (spanText.includes(word)) {
            const title = $(this).text();
            const url = $(this).parents().attr("href");
            if (!filteredArticles.find((obj) => obj.title === title)) {
              filteredArticles.push({
                title,
                url: newspaperBase + url,
                source: newspaperId,
              });
            }
          }
        });
      });
      res.json(filteredArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
