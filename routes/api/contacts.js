const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
  res.json({ message: "Home work start" });
});

router.get("/:contactId", async (req, res, next) => {
  res.json({ message: "test" });
});

router.post("/", async (req, res, next) => {
  res.json({ message: "gogo" });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "go" });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "test ok" });
});

module.exports = router;
