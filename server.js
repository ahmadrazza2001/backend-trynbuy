const app = require("./app");
const env = require("dotenv");
env.config();
const port = process.env.PORT ? +process.env.PORT : 8080;
const server = app.listen(port, () => {
  console.log(`Server running at Port ${port}`);
});

server.on("error", (err) => {
  console.log("server error: ", err);
});

server.on("clientError", (err) => {
  console.log("client error: ", err);
});

process.on("uncaughtException", (err) => {
  console.log("gracefully shutting down server");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
