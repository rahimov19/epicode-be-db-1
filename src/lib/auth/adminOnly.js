import createHttpError from "http-errors";

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.author.role === "Admin") {
    next();
  } else {
    next(createHttpError(403, "Not your zone to work"));
  }
};
