import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";
import verifyToken from "../../middleware/verifyToken.js";
import verifyAuthor from "../../middleware/verifyAuthor.js";

const replyRouter = Router();

replyRouter.get("/:commentID/replies", async (req, res, next) => {
  try {
    const commentID = parseInt(req.params.commentID);

    if (isNaN(commentID)) {
      const err = new Error("Post not found");
      err.status = 400;
      return next(err);
    }

    const replies = await prisma.reply.findMany({
      where: { commentID: commentID },
    });

    res.status(200).json(replies);
  } catch (err) {
    next(err);
  }
});

replyRouter.post("/:commentID/replies", verifyToken, async (req, res, next) => {
  try {
    const newReply = await prisma.reply.create({
      data: {
        replybody: req.body.replybody,
        authorID: req.user.id,
        commentID: parseInt(req.params.commentID),
      },
    });
    res.status(201).json(newReply);
  } catch (err) {
    next(err);
  }
});

replyRouter.patch(
  "/:commentID/replies/:replyID",
  verifyToken,
  async (req, res, next) => {
    try {
      const replyID = parseInt(req.params.replyID);

      if (isNaN(replyID))
        return res.status(404).json({ error: "Invalid Reply ID" });

      const findReply = await prisma.reply.findUnique({
        where: { id: replyID },
      });
      if (!findReply) {
        return res.status(404).json({ error: "Reply not found" });
      }

      if (req.user.id === findReply.authorID) {
        const reply = await prisma.reply.update({
          where: { id: replyID },
          data: {
            replybody: req.body.replybody,
          },
        });
        return res.status(200).json(reply);
      } else {
        return res.status(403).json({ error: "Unauthorized Credentials" });
      }
    } catch (err) {
      next(err);
    }
  },
);

replyRouter.delete(
  "/:commentID/replies/:replyID",
  verifyToken,
  async (req, res, next) => {
    try {
      const replyID = parseInt(req.params.replyID);
      if (isNaN(replyID))
        return res.status(404).json({ error: "Invalid Reply ID" });

      const commentID = parseInt(req.params.commentID);
      if (isNaN(commentID))
        return res.status(404).json({ error: "Invalid Comment ID" });

      const findReply = await prisma.reply.findUnique({
        where: { id: replyID },
      });
      if (!findReply) {
        return res.status(404).json({ error: "Reply Not Found" });
      }

      const findComment = await prisma.comment.findUnique({
        where: { id: commentID },
      });
      if (!findComment) {
        return res.status(404).json({ error: "Comment Not Found" });
      }
      if (
        req.user.id === findReply.authorID ||
        req.user.id === findComment.authorID
      ) {
        const reply = await prisma.reply.delete({
          where: { id: replyID },
        });
        return res.status(200).json(reply);
      } else {
        return res.status(403).json({ error: "Unauthorized Credentials" });
      }
    } catch (err) {
      next(err);
    }
  },
);

export default replyRouter;
