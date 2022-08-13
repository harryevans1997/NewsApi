const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { sportsJargon } = require("./libs/keywords/sports");

const app = express();
const PORT = process.env.PORT || 8000;

const newspapers = [
  {
    name: "wsj",
    address: "https://www.wsj.com/news/sports",
    base: "",
  },
  {
    name: "si",
    address: "https://www.si.com/",
    base: "https://www.si.com",
  },
  {
    name: "nytimes",
    address: "https://www.nytimes.com/section/sports",
    base: "https://www.nytimes.com/",
  },
];

const articles = [];
exports.articles = articles;

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      if (newspaper.name === "nytimes") {
        $("h2 > a", html).each(function () {
          const spanText = $(this).text().toLowerCase();
          sportsJargon.forEach((word) => {
            if (spanText.includes(word)) {
              const title = $(this).text();
              const url = $(this).attr("href");
              if (!articles.find((obj) => obj.title === title)) {
                articles.push({
                  title,
                  url: url.includes("https") ? url : newspaper.base + url,
                  source: newspaper.name,
                });
              }
            }
          });
        });
      }

      // searches each <a> and checks if the first child (and descendants) contains any of the sports keywords
      $("a > :first-child", html).each(function () {
        const spanText = $(this).text().toLowerCase();

        // wsj has extra text selected with this query (eg: 3 min read), this filters it out before adding it to the article array
        if (newspaper.name === "wsj") {
          sportsJargon.forEach((word) => {
            if (spanText.includes(word)) {
              const title = $(this).text();
              const url = $(this).parents().attr("href");

              const regex = /(\d{1})[^\d]*min read/;
              const matched = title.match(regex);
              // if the selected article title contains the extra text, filter it out
              if (matched) {
                const badSubstring = matched[0];
                const splitTitle = title.split(badSubstring);
                const filteredTitle = splitTitle[0];
                if (!articles.find((obj) => obj.url === url)) {
                  articles.push({
                    title: filteredTitle.trim(),
                    url: url.includes("https") ? url : newspaper.base + url,
                    source: newspaper.name,
                  });
                }
                // otherwise just push the article as it is to the article array
              } else {
                if (!articles.find((obj) => obj.url === url)) {
                  articles.push({
                    title,
                    url: url.includes("https") ? url : newspaper.base + url,
                    source: newspaper.name,
                  });
                }
              }
            }
            return;
          });
        }

        sportsJargon.forEach((word) => {
          if (spanText.includes(word)) {
            const title = $(this).text();
            const url = $(this).parents().attr("href");
            if (!articles.find((obj) => obj.url === url)) {
              articles.push({
                title,
                url: url.includes("https") ? url : newspaper.base + url,
                source: newspaper.name,
              });
            }
          }
        });
      });
    })
    .catch((err) => console.log(err));
});

// root path that welcomes users
app.get("/", (req, res) => {
  res.json("Welcome to my Sports News API");
});

// returns all news articles
app.get("/news", (req, res) => {
  res.json(articles);
});

// returns news articles from a specific newspaper
app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;

  // returns the filtered newspaper based on what the user puts as the URI
  const newspaper = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0];
  console.log(newspaper);

  // fetch from the filtered newspaper starts here
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const filteredArticles = [];

      // logic that returns the filtered response for the nytimes
      if (newspaper.name === "nytimes") {
        // searched all <h2> for their <a> and checks if either contain any of the sports keywords
        $("h2 > a", html).each(function () {
          const spanText = $(this).text().toLowerCase();
          sportsJargon.forEach((word) => {
            if (spanText.includes(word)) {
              const title = $(this).text();
              const url = $(this).attr("href");
              if (!filteredArticles.find((obj) => obj.title === title)) {
                filteredArticles.push({
                  title,
                  url: url.includes("https") ? url : newspaper.base + url,
                  source: newspaper.name,
                });
              }
            }
          });
        });
        res.json(filteredArticles);
        return;
      }

      // logic that returns the filtered response for the wsj
      if (newspaper.name === "wsj") {
        // searches each <a> and checks if the first child (and descendants) contains any of the sports keywords
        $("a > :first-child", html).each(function () {
          const spanText = $(this).text().toLowerCase();
          sportsJargon.forEach((word) => {
            if (spanText.includes(word)) {
              const title = $(this).text();
              const url = $(this).parents().attr("href");

              const regex = /(\d{1})[^\d]*min read/;
              const matched = title.match(regex);
              // if the selected article title contains the extra text, filter it out
              if (matched) {
                const badSubstring = matched[0];
                const splitTitle = title.split(badSubstring);
                const filteredTitle = splitTitle[0];
                if (!filteredArticles.find((obj) => obj.url === url)) {
                  filteredArticles.push({
                    title: filteredTitle.trim(),
                    url: url.includes("https") ? url : newspaper.base + url,
                    source: newspaper.name,
                  });
                }
                // otherwise just push the article as it is to the article array
              } else {
                if (!filteredArticles.find((obj) => obj.url === url)) {
                  filteredArticles.push({
                    title,
                    url: url.includes("https") ? url : newspaper.base + url,
                    source: newspaper.name,
                  });
                }
              }
            }
          });
        });
        res.json(filteredArticles);
        return;
      }

      // currently, all other newspapers can be filtered using this logic
      // searches each <a> and checks if the first child (and descendants) contains any of the sports keywords
      $("a > :first-child", html).each(function () {
        const spanText = $(this).text().toLowerCase();

        sportsJargon.forEach((word) => {
          if (spanText.includes(word)) {
            const title = $(this).text();
            const url = $(this).parents().attr("href");
            if (!filteredArticles.find((obj) => obj.title === title)) {
              filteredArticles.push({
                title,
                url: url.includes("https") ? url : newspaper.base + url,
                source: newspaper.name,
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
