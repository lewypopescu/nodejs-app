const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
  res.json({ message: "Home goooo" });
});

router.get("/:contactId", async (req, res, next) => {
  res.json({ message: "test11111&" });
});

router.post("/", async (req, res, next) => {
  res.json({ message: "aaaaaa" });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "test" });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "gogo" });
});

module.exports = router;
