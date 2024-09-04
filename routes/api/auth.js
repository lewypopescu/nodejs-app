import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { Jimp } from "jimp";
import User from "../../models/users.model.js";

const router = express.Router();

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Validation Error: Email and password are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Conflict Error: Email in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURLSet = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });

    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter",
      token: null,
      avatarURL: avatarURLSet,
    });

    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
      message: "Registration successful",
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { path: tempPath, originalname } = req.file;
      const { _id: userId } = req.user;

      const avatarName = `${userId}_${originalname}`;
      const resultPath = path.join("public/avatars", avatarName);

      const image = await Jimp.read(tempPath);
      await image.resize(250, 250).writeAsync(resultPath);

      await fs.unlink(tempPath);

      const avatarURL = `/avatars/${avatarName}`;
      req.user.avatarURL = avatarURL;
      await req.user.save();

      res.status(200).json({ avatarURL });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
export { auth };
