import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import blogsRouter from "./api/blogs/index.js";
import passport from "passport";

import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
  unAuthorizedHandler,
} from "./errorHandlers.js";
import googleStrategy from "./lib/auth/google.js";
import authorsRouter from "./api/authors/index.js";

const server = express();
const port = process.env.port;

passport.use("google", googleStrategy);

server.use(cors());
server.use(express.json());
server.use(passport.initialize());

server.use("/blogs", blogsRouter);
server.use("/authors", authorsRouter);

server.use(badRequestHandler);
server.use(unAuthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server), console.log(`Server port is ${port}`));
  });
});
