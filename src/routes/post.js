import { Router } from "express";
import { prisma } from "../../db/prismaClient.js";
import verifyToken from "../../middleware/verifyToken.js";
import verifyAuthor from "../../middleware/verifyAuthor.js";

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
postRouter.get("/unpublished", verifyToken, async (req, res, next) => {
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
postRouter.get("/unpublished/:postID", verifyToken, async (req, res, next) => {
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

postRouter.post("/posts", verifyToken, verifyAuthor, async (req, res, next) => {
  try {
    const newPost = await prisma.post.create({
      data: {
        title: req.body.title,
        postbody: req.body.postbody,
        published: req.body.published,
        authorID: req.user.id,
      },
    });
    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
});

postRouter.patch(
  "/posts/:postID",
  verifyToken,
  verifyAuthor,
  async (req, res, next) => {
    try {
      const postID = parseInt(req.params.postID);

      if (isNaN(postID))
        return res.status(404).json({ error: "Invalid Post ID" });

      const post = await prisma.post.update({
        where: { id: postID },
        data: {
          title: req.body.title,
          postbody: req.body.postbody,
          published: req.body.published,
        },
      });
      return res.status(200).json(post);
    } catch (err) {
      next(err);
    }
  },
);

postRouter.delete(
  "/posts/:postID",
  verifyToken,
  verifyAuthor,
  async (req, res, next) => {
    try {
      const postID = parseInt(req.params.postID);

      if (isNaN(postID))
        return res.status(404).json({ error: "Invalid Post ID" });

      const post = await prisma.post.delete({
        where: { id: postID },
      });
      return res.status(200).json(post);
    } catch (err) {
      next(err);
    }
  },
);

export default postRouter;
