const request = require("supertest");
const app = require("../app");

describe("User Registration", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      role: "Viewer"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      role: "Viewer"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
