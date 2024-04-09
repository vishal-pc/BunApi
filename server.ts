import Elysia from "elysia";
import { PrismaClient } from "@prisma/client";
import figlet from "figlet";
import route from "./src/router/userRouter";

const db = new PrismaClient();
const app = new Elysia();
const port = Bun.env.Port!;

app.get("/", () => {
  const body = figlet.textSync("Hello From Bun!");
  return new Response(body);
});

app.group("/api/v1", (group) => {
  return group.use(route);
});

app.listen(port, () => {
  console.log(`🦊 Elysia server is running ${port}...🚀`);
  const error = false;
  if (error) {
    console.log("🦊 Server is not running...😴");
  }
});

db.$connect()
  .then(() => {
    console.log("🦊 Database is connected 🔥");
  })
  .catch((error) => {
    console.error("🦊 Error connecting to database...🥱", error);
    process.exit(1);
  });
