import express from "express";

const app = express();
const PORT = "8080";

app.get("/", (req, res) => {
  return res.send("hello world");
});

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
