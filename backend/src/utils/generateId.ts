// backend/src/utils/generateId.ts
//
// WHAT  Generates the short, URL-safe public id for each image (e.g. "a3f9b2c1").
// HOW   const id = generateId(); used as the DB primary key and in the public URL.
// WHY   A random id (vs the filename or a sequential number) avoids collisions, hides how
//       many images exist, and stops people enumerating others' uploads by guessing IDs.
// ALTERNATIVES
//   - Auto-increment integer: smallest + sortable, but enumerable and leaks volume.
//   - UUID v4: collision-free and standard, but long and ugly in URLs.
//   - nanoid (chosen): short, URL-safe, tunable length; lengthen it if you expect billions.

import { customAlphabet } from "nanoid";

// 36^8 ≈ 2.8e12 possibilities — ample for this scale; bump the length to grow it.
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export const generateId = (): string => nanoid();
