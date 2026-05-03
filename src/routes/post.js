import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";

const postRouter = Router();

postRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await prisma.post.findMany({
      where: { published: true },
    });
    res.json(allPosts);
  } catch (err) {
    next(err);
  }
});

export default postRouter;
