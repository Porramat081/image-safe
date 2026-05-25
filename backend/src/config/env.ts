// backend/src/config/env.ts
//
// WHAT  Loads and validates environment variables once at startup, exposing a typed,
//       frozen `env` object to the rest of the app.
// HOW   Import { env } anywhere you need config; never read process.env directly
//       elsewhere. Add a new variable by parsing + validating it here and adding it to
//       the Env type.
// WHY   "Fail fast": a missing DATABASE_URL crashes the process on boot with a clear
//       message, instead of throwing on the first request hours later. And typed access
//       means no `process.env.PROT` typos returning undefined.
// ALTERNATIVES
//   - Read process.env inline wherever needed: no upfront file, but configuration is
//     scattered, untyped, and unvalidated — errors surface late and randomly.
//   - A schema validator (zod/envalid): same idea with less hand-written code; a natural
//     upgrade once the variable list grows.
//
// TODO:
//   - call dotenv.config()
//   - read each variable from process.env
//   - throw a descriptive Error if a required one is missing
//     (R2_* are only required when STORAGE_DRIVER === "r2")
//   - export a frozen, fully-typed `env` object
//
// export interface Env { PORT: number; DATABASE_URL: string; STORAGE_DRIVER: "local" | "r2"; ... }
// export const env: Env = ...

import dotenv from "dotenv";

dotenv.config();

export interface Env {
  PORT: number;
  DATABASE_URL: string;
  STORAGE_DRIVER: "local" | "r2";
  PUBLIC_BASE_URL: string;        // base used to build local-disk public/serve URLs
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

const STORAGE_DRIVER = (process.env.STORAGE_DRIVER || "local") as Env["STORAGE_DRIVER"];
if (STORAGE_DRIVER !== "local" && STORAGE_DRIVER !== "r2") {
  throw new Error(`STORAGE_DRIVER must be "local" or "r2" (got "${STORAGE_DRIVER}")`);
}

const PORT = parseInt(process.env.PORT || "4000", 10);

export const env: Env = Object.freeze({
  PORT,
  DATABASE_URL: required("DATABASE_URL"),
  STORAGE_DRIVER,
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
});

// Fail fast: if we're using R2, every R2_* var must be present.
if (STORAGE_DRIVER === "r2") {
  for (const key of [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
  ] as const) {
    if (!env[key]) throw new Error(`STORAGE_DRIVER=r2 but ${key} is not set`);
  }
}
