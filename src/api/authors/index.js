import express from "express";
import createHttpError from "http-errors";
import AuthorsModel from "./model.js";
import q2m from "query-to-mongo";

const authorsRouter = express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
authorsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await AuthorsModel.countDocuments(mongoQuery.criteria);
    const authors = await AuthorsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3001/authors", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      authors,
    });
  } catch (error) {
    next(error);
  }
});
authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId);
    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(
          404,
          `author with id ${req.params.authorId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const updatedauthor = await AuthorsModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedauthor) {
      res.send(updatedauthor);
    } else {
      next(
        createHttpError(
          404,
          `author with id ${req.params.authorId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedauthor = await AuthorsModel.findByIdAndDelete(
      req.params.authorId
    );
    if (deletedauthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `author with id ${req.params.authorId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
