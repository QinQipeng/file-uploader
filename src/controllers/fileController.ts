import bcrypt from "bcryptjs"
import multer from "multer"
import { type Request, Response, NextFunction } from "express"

const upload = multer({ dest: './filesystem' })

const saveFileToDest = [
  upload.single('file'),
  function (req: Request, res: Response, next: NextFunction) {
    console.log(req.file)
    res.redirect("/")
  }
]


export default { saveFileToDest }