import fs from "fs";
import path from "path";

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const migrations = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

console.log(migrations.join("\n"));
