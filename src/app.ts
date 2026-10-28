import "./auth/passport.ts";
import path from "node:path";
import passport from "passport";
import flash from "connect-flash";
import session from "express-session";
import { prisma } from "./lib/prisma";
import { randomBytes } from "node:crypto";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import express, { type Request, type Response, type NextFunction } from "express";

import userRouter from "./routers/userRouter";
import fileRouter from "./routers/fileRouter.ts";
import folderRouter from "./routers/folderRouter.ts";
import { Folder, User } from "../generated/prisma/client.ts";

const app = express();

const __dirname = import.meta.dirname;
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const PrismaStore = new PrismaSessionStore(prisma, {
  checkPeriod: 2 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

const sessionSecret = process.env.SESSION_SECRET ?? randomBytes(32).toString("hex");

app.use(
  session({
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: PrismaStore,
  }),
);

app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

app.use(flash());
app.use("/", userRouter);
app.use("/file", fileRouter);
app.use("folder", folderRouter)

app.get("/", (req: Request, res: Response) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  const user = req.user as User & { root: Folder[] }
  res.render("index", { user: user, currFolder: user.root });
});

const PORT = 8333;
app.listen(PORT, (error) => {
  if (error) throw error;

  console.log(`Fileuploader - listening on port ${PORT}!`);
});
