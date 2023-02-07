import createHttpError from "http-errors";
import atob from "atob";
import AuthorsModel from "../../api/authors/model.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please give Authorization HEader"));
  } else {
    const encodedCredentials = req.headers.authorization.split(" ")[1];
    const credentials = atob(encodedCredentials);
    const [email, password] = credentials.split(":");
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      req.author = author;
      next();
    } else {
      next(createHttpError(401, "Login or Password is wrong! "));
    }
  }
};
