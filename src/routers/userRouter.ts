import { Router } from "express";
import userController from "../controllers/userController";
import { type Request, type Response, type NextFunction } from "express";

const userRouter = Router();

userRouter.get("/login", userController.authLoginGet);
userRouter.post("/login", userController.authLoginPost);
userRouter.get("/sign-up", userController.authSignUpGet);
userRouter.post("/sign-up", userController.authRegisterPost);
userRouter.get("/log-out", userController.authLogoutGet);
userRouter.get("/", (req: Request, res: Response) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  res.render("index", {user: req.user});
});

export default userRouter;
