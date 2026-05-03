import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  return res.send(Object.values(req.context.models.users));
});

export default userRouter;
