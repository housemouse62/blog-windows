import "dotenv/config";
import express from "express";
import models from "./src/models/index.js";
import routes from "./src/routes/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.context = {
    models,
    me: models.users[1],
  };
  next();
});

app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/posts", routes.post);

app.listen(process.env.PORT, () =>
  console.log(`Blog App listening on port ${process.env.PORT}`),
);
