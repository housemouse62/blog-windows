import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";

const postRouter = Router();

// view all published posts
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

// view all unpublished posts
postRouter.get("/unpublished", async (req, res, next) => {
  try {
    const unpublishedPosts = await prisma.post.findMany({
      where: { published: false },
    });
    res.json(unpublishedPosts);
  } catch (err) {
    next(err);
  }
});

// view one unpublished post
postRouter.get("/unpublished/:postID", async (req, res, next) => {
  try {
    const postID = parseInt(req.params.postID);
    if (isNaN(postID)) {
      const err = new Error("Post not found");
      err.status = 400;
      return next(err);
    }
    const unpublishedPost = await prisma.post.findUnique({
      where: { id: postID },
    });
    if (!unpublishedPost || unpublishedPost.published) {
      const err = new Error("No unpublished post");
      err.status = 404;
      return next(err);
    }
    res.json(unpublishedPost);
  } catch (err) {
    next(err);
  }
});

// view single post
postRouter.get("/:postID", async (req, res, next) => {
  try {
    const postID = parseInt(req.params.postID);
    if (isNaN(postID)) {
      const err = new Error("Post not found");
      err.status = 400;
      return next(err);
    }
    const singlePost = await prisma.post.findUnique({
      where: { id: postID },
    });
    if (!singlePost || !singlePost.published) {
      const err = new Error("Post not found");
      err.status = 404;
      return next(err);
    }
    res.json(singlePost);
  } catch (err) {
    next(err);
  }
});

export default postRouter;
