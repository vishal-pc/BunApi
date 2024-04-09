import Elysia from "elysia";
import { register, userLogin } from "../controller/userController";

const route = new Elysia();

route.post("/register", register);
route.post("/login", userLogin);

export default route;
