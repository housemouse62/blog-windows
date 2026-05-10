import "dotenv/config";
import express from "express";
import postRouter from "./src/routes/post.js";
import userRouter from "./src/routes/user.js";
import commentRouter from "./src/routes/comment.js";
import cors from "cors";
import replyRouter from "./src/routes/reply.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/posts", commentRouter);
app.use("/posts/:postID", replyRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(process.env.PORT, () =>
  console.log(`Blog App listening on port ${process.env.PORT}`),
);
