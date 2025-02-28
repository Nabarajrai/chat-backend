import express from "express";
//routers
import authRouter from "./routes/auth.js";
const app = express();
const PORT = "8080";

app.get("/", (req, res) => {
  return res.send("hello world");
});

app.use(express.json());

//routes
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
