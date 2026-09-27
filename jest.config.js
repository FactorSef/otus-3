//#region Добавление Unit-тестов
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+.ts$": ["ts-jest", { diagnostics: { ignoreCodes: ["TS151001"] } }],
  },
  collectCoverageFrom: ["src/**/*.ts"],
};
//#endregion Добавление Unit-тестов
