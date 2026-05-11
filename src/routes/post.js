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
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });
    res.json(allPosts);
  } catch (err) {
    next(err);
  }
});

// view all published and unpublished posts for Admin side
postRouter.get(
  "/allPosts",
  verifyToken,
  verifyAuthor,
  async (req, res, next) => {
    try {
      const allPosts = await prisma.post.findMany({
        include: {
          _count: {
            select: { comments: true },
          },
        },
      });
      res.json(allPosts);
    } catch (err) {
      next(err);
    }
  },
);

// view one post for admin side
postRouter.get(
  "/allPosts/:postID",
  verifyToken,
  verifyAuthor,
  async (req, res, next) => {
    try {
      const postID = parseInt(req.params.postID);
      if (isNaN(postID)) {
        const err = new Error("Post not found");
        err.status = 400;
        return next(err);
      }
      const singlePost = await prisma.post.findUnique({
        where: { id: postID },
        include: {
          comments: {
            include: { author: true, reply: { include: { author: true } } },
          },
        },
      });
      if (!singlePost) {
        const err = new Error("No post found");
        err.status = 404;
        return next(err);
      }
      res.json(singlePost);
    } catch (err) {
      next(err);
    }
  },
);

// view single post public side
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
      include: { comments: { include: { author: true } } },
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

// Create post admin side
postRouter.post("/", verifyToken, verifyAuthor, async (req, res, next) => {
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

// edit post admin side
postRouter.patch(
  "/:postID",
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

// delete post admin side
postRouter.delete(
  "/:postID",
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
