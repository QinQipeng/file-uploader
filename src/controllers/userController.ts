import bcrypt from "bcryptjs";
import passport from "passport";
import userModel from "../models/userModel.ts";
import { body, validationResult } from "express-validator";
import { type Request, type Response, type NextFunction } from "express";

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const emailErr = "is not a valid email address (e.g: joedoe@example.com)"
const pwdErr = "Your Password must be at least 8 chars long"

function authLoginGet(req: Request, res: Response) {
  res.render("login", {errors: req.flash("error")});
}

const authLoginPost = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    failureMessage: true,
  })

function authSignUpGet(req: Request, res: Response) {
  const error_messages = req.flash('validation_errors');
  res.render("sign-up", {errors: error_messages});
}

const authRegisterPost = [
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hasedPassword = await bcrypt.hash(req.body.password, 10);
      await userModel.createUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hasedPassword
      })
      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  } 
]

function authLogoutGet(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

export default {
  authLoginGet,
  authLoginPost,
  authSignUpGet,
  authRegisterPost,
  authLogoutGet,
};