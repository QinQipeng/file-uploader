import { Router } from "express";
import userController from "../controllers/userController";

const userRouter = Router();

userRouter.get("/login", userController.authLoginGet);
userRouter.post("/login", userController.authLoginPost);
userRouter.get("/sign-up", userController.authSignUpGet);
userRouter.post("/sign-up", userController.authRegisterPost);
userRouter.get("/log-out", userController.authLogoutGet);

export default userRouter;
