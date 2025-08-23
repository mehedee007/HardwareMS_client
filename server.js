const express = require("express");
const cors = require("cors");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const hostname = "localhost";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Enable CORS for all routes
  server.use(cors());

  // Define your custom routes
  server.get("/a", (req, res) => app.render(req, res, "/a", req.query));
  server.get("/b", (req, res) => app.render(req, res, "/b", req.query));

  // Handle all other routes with Next.js
  server.all("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  // Listen on the port
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
