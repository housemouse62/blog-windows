function verifyAuthor(req, res, next) {
  if (req.user.usertype !== "author")
    return res.status(401).json({ error: "Unauthorized user" });
  next();
}

export default verifyAuthor;
