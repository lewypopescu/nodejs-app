import express from "express";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { Jimp } from "jimp";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { sendEmail } from "../../sendEmail.js";

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
      return res
        .status(409)
        .json({ message: "Conflict Error: Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarURLSet = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter",
      token: null,
      avatarURL: avatarURLSet,
      verify: false,
      verificationToken,
    });

    await newUser.save();

    const verificationLink = `${process.env.BASE_URL}/auth/verify/${verificationToken}`;

    await sendEmail(
      newUser.email,
      "Verify your email address",
      `Click the following link to verify your email: ${verificationLink}`,
      `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`
    );

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURLSet,
      },
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  try {
    const payload = {
      id: user._id,
      email: user.email,
      subscription: user.subscription,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/current", auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

export { auth };
export default router;
