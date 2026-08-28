describe("Phase 4 configuration validation", () => {
  test("accepts a valid configuration", () => {
    const { validateConfig } = require("../../Restaurant_POS_System/pos-backend/config/config");
    expect(validateConfig({ port: 3000, databaseURI: "mongodb://localhost/test", nodeEnv: "test", accessTokenSecret: "short" })).toEqual([]);
  });

  test("requires a strong production JWT secret", () => {
    const { validateConfig } = require("../../Restaurant_POS_System/pos-backend/config/config");
    expect(validateConfig({ port: 3000, databaseURI: "mongodb://localhost/test", nodeEnv: "production", accessTokenSecret: "short" })).toContain("JWT_SECRET must contain at least 32 characters in production.");
  });

  test("rejects invalid ports", () => {
    const { validateConfig } = require("../../Restaurant_POS_System/pos-backend/config/config");
    expect(validateConfig({ port: 70000, databaseURI: "mongodb://localhost/test", nodeEnv: "test" })).toContain("PORT must be an integer from 1 to 65535.");
  });
});
