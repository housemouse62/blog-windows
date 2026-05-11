import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";
import verifyToken from "../../middleware/verifyToken.js";
import verifyAuthor from "../../middleware/verifyAuthor.js";

const commentRouter = Router();

commentRouter.get("/:postID/comments", async (req, res, next) => {
  try {
    const postID = parseInt(req.params.postID);

    if (isNaN(postID)) {
      const err = new Error("Post not found");
      err.status = 400;
      return next(err);
    }

    const comments = await prisma.comment.findMany({
      where: { postID: postID },
      include: { author: { include: { screenname: true } } },
    });
    console.log(comments);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

commentRouter.post("/:postID/comments", verifyToken, async (req, res, next) => {
  try {
    const newComment = await prisma.comment.create({
      data: {
        commentbody: req.body.commentbody,
        authorID: req.user.id,
        postID: parseInt(req.params.postID),
      },
    });
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
});

commentRouter.patch(
  "/:postID/comments/:commentID",
  verifyToken,
  async (req, res, next) => {
    try {
      const commentID = parseInt(req.params.commentID);

      if (isNaN(commentID))
        return res.status(404).json({ error: "Invalid Comment ID" });

      const findComment = await prisma.comment.findUnique({
        where: { id: commentID },
      });
      if (!findComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (req.user.id === findComment.authorID) {
        const comment = await prisma.comment.update({
          where: { id: commentID },
          data: {
            commentbody: req.body.commentbody,
          },
        });
        return res.status(200).json(comment);
      } else {
        return res.status(403).json({ error: "Unauthorized Credentials" });
      }
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.delete(
  "/:postID/comments/:commentID",
  verifyToken,
  async (req, res, next) => {
    try {
      const commentID = parseInt(req.params.commentID);
      if (isNaN(commentID))
        return res.status(404).json({ error: "Invalid Comment ID" });

      const postID = parseInt(req.params.postID);
      if (isNaN(postID))
        return res.status(404).json({ error: "Invalid Post ID" });

      const findComment = await prisma.comment.findUnique({
        where: { id: commentID },
      });
      if (!findComment) {
        return res.status(404).json({ error: "Comment Not Found" });
      }

      const findPost = await prisma.post.findUnique({
        where: { id: postID },
      });
      if (!findPost) {
        return res.status(404).json({ error: "Post Not Found" });
      }
      if (
        req.user.id === findComment.authorID ||
        req.user.id === findPost.authorID
      ) {
        const comment = await prisma.comment.delete({
          where: { id: commentID },
        });
        return res.status(200).json(comment);
      } else {
        return res.status(403).json({ error: "Unauthorized Credentials" });
      }
    } catch (err) {
      next(err);
    }
  },
);

export default commentRouter;
