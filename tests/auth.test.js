import request from "supertest";
import app from "../app";
import User from "../models/users.model";

describe("POST /api/auth/login", () => {
  let user;

  beforeAll(async () => {
    user = await User.create({
      email: "hello@example.com",
      password: "hello12345",
      subscription: "starter",
    });
  });

  afterAll(async () => {
    await User.deleteOne({ email: "hello@example.com" });
  });

  it("should return a 200 status code and a token", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "hello@example.com",
      password: "hello12345",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toMatchObject({
      email: "hello@example.com",
      subscription: "starter",
    });
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });

  it("should return a 401 status code for invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "hello@example.com",
      password: "hello",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Email or password is wrong");
  });
});
