import { db } from "./lib/db";

async function test() {
  const profiles = await db.profile.findMany(); // <- IntelliSense should show all methods here
  console.log(profiles);
}

test();
