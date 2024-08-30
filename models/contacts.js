import { error } from "console";
import e from "express";
import fs from "fs/promises";
import { nanoid } from "nanoid";

const contactsPath = "./models/contacts.json";

export const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((contact) => contact.id === contactId);
    return contact;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const addContact = async (body) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const newContact = {
      id: nanoid(),
      ...body,
    };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const removeContact = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const deleteContact = contacts.find((contact) => contact.id === contactId);
    if (!deleteContact) {
      return null;
    }
    const newContacts = contacts.filter((contact) => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(newContacts, null, 2));
    return deleteContact;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const updateContact = async (contactId, body) => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const contactIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );
    if (contactIndex === -1) {
      throw new Error("Contact not found");
    }
    const updatedContact = {
      id: contactId,
      name: body.name || contacts[contactIndex].name,
      email: body.email || contacts[contactIndex].email,
      phone: body.phone || contacts[contactIndex].phone,
    };
    contacts[contactIndex] = updatedContact;
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return updatedContact;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};
