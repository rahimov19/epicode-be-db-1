import express from "express";
import createHttpError from "http-errors";
import BlogsModel from "./model.js";
import q2m from "query-to-mongo";
import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js";
import { adminOnlyMiddleware } from "../../lib/auth/adminOnly.js";

const blogsRouter = express.Router();

blogsRouter.post("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
blogsRouter.get(
  "/",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);
      const total = await BlogsModel.countDocuments(mongoQuery.criteria);
      const blogs = await BlogsModel.find(
        mongoQuery.criteria,
        mongoQuery.options.fields
      )
        .limit(mongoQuery.options.limit)
        .skip(mongoQuery.options.skip)
        .sort(mongoQuery.options.sort)
        .populate({
          path: "author",
        });
      res.send({
        links: mongoQuery.links("http://localhost:3001/blogs", total),
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        blogs,
      });
    } catch (error) {
      next(error);
    }
  }
);
blogsRouter.get("/:blogId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId).populate({
      path: "author",
    });
    if (blog) {
      res.send(blog);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});
blogsRouter.put("/:blogId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const blogToUpdate = await BlogsModel.findById(req.params.blogId).populate({
      path: "author",
    });
    if (blogToUpdate) {
      const authorToFind = blogToUpdate.author.find(
        (author) => author._id.toString() === req.author._id.toString()
      );

      if (authorToFind) {
        const updatedBlog = await BlogsModel.findByIdAndUpdate(
          req.params.blogId,
          req.body,
          { new: true, runValidators: true }
        );
        res.send(updatedBlog);
      } else {
        next(createHttpError(401, "It's not your post"));
      }
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});
blogsRouter.delete("/:blogId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const blogToDelete = await BlogsModel.findById(req.params.blogId).populate({
      path: "author",
    });
    if (blogToDelete) {
      const authorToFind = blogToUpdate.author.find(
        (author) => author._id.toString() === req.author._id.toString()
      );
      if (authorToFind) {
        const updatedBlog = await BlogsModel.findByIdAndDelete(
          req.params.blogId
        );
        res.status(204).send();
      } else {
        next(createHttpError(401, "It's not your post"));
      }
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.post("/:blogId/comments", async (req, res, next) => {
  try {
    const selectedBlog = await BlogsModel.findById(req.body.blogId, { _id: 0 });

    if (selectedBlog) {
      const commentToInsert = {
        ...selectedBlog.toObject(),
        commentDate: new Date(),
      };
      console.log(commentToInsert);
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.blogId,
        { $push: { comments: commentToInsert } },
        { new: true, runValidators: true }
      );

      res.send(updatedBlog);
    } else {
      next(createHttpError(404, `Blog with id ${req.body.blogId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId/comments", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      res.send(blog.comments);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      const comment = user.comments.find(
        (com) => com._id.toString() === req.params.commentId
      );
      if (comment) {
        res.send(comment);
      } else {
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} is not found`
        );
      }
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      const index = user.comments.findIndex(
        (com) => com._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        blog.comments[index] = {
          ...blog.comments[index].toObject(),
          ...req.body,
        };
        await blog.save();
        res.send(blog);
      } else {
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} is not found`
        );
      }
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const updatedBlog = await BlogsModel.findByIdAndUpdate(
      req.params.blogId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
