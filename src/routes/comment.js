import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";
import verifyToken from "../../middleware/verifyToken.js";
import verifyAuthor from "../../middleware/verifyAuthor.js";

const commentRouter = Router();

commentRouter.get("/:postID/comments", async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postID: parseInt(req.params.postID) },
    });
    if (isNaN(postID)) {
      const err = new Error("Post not found");
      err.status = 400;
      return next(err);
    }
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

commentRouter.get("/:postID/comments/:commentID", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
// get /posts/:postID/comments/:commentID
// post /posts/:postID/comments
// update /posts/:postID/comments/:commentID
// delete /posts/:postID/comments/:commentID

export default commentRouter;
