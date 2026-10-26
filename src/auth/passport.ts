import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcryptjs"
import userModel from "../models/userModel"
import { User } from "../../generated/prisma/client"

const authenErrorMsg = "Authenticating Failed: Invalid User Email or Password";
const customFields = {
  usernameField: "email"
};

const verifyCallback = async (
  email: string,
  password: string,
  done: Function
) => {
  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: authenErrorMsg });
    }

    const isValid = await bcrypt.compare(password, String(user.password))
    return isValid
      ? done(null, user)
      : done(null, false, { message: authenErrorMsg });
  } catch (err) {
    return done(err)
  }
}

passport.serializeUser((user: User | any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.getUserById(String(id));
    if (!user) {
      return done(null, false);
    }

    done(null, user)
  } catch (err) {
    done(err);
  }
})

passport.use(new LocalStrategy(customFields, verifyCallback));