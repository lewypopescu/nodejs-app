import express from "express";
import Joi from "joi";
import Contact from "../../models/contacts.model.js";
import { auth } from "../api/auth.js";

const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Set name for contact",
  }),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
  favorite: Joi.boolean().default(false),
});

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const { favorite, page = 1, limit = 20 } = req.query;
    const query = { owner: req.user._id };

    if (favorite) {
      query.favorite = favorite === "true";
    }

    const contacts = await Contact.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.user._id,
    });

    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const contact = new Contact({ ...req.body, owner: req.user._id });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findOneAndDelete({
      _id: contactId,
      owner: req.user._id,
    });

    if (contact) {
      res.status(200).json({ message: "Contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", auth, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { contactId } = req.params;
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: req.user._id },
      req.body,
      { new: true }
    );

    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (typeof favorite !== "boolean") {
    return res.status(400).json({ message: "Missing field favorite" });
  }

  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: req.user._id },
      { favorite },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

export default router;
