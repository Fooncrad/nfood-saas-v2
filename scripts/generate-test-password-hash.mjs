import { randomBytes, scryptSync } from "node:crypto";
const password = process.argv[2];
if (!password) throw new Error("Password argument required");
const salt = randomBytes(16);
const key = scryptSync(password, salt, 64);
console.log(`scrypt$${salt.toString("base64")} $${key.toString("base64")}`.replace(" $", "$"));
