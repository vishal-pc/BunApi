import { PrismaClient } from "@prisma/client";
import { passwordRegex, emailValidate } from "../utils/helper";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = new PrismaClient();

export const register = async (req: any) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return {
        message: "Name, email, or password is missing in request body",
        status: 400,
      };
    }
    if (!emailValidate(email)) {
      return {
        message: "Invalid email",
        status: 400,
      };
    }

    const existingUser = await db.user.findUnique({ where: { email: email } });
    if (existingUser) {
      return {
        message: `User with email ${email} already exists`,
        status: 400,
      };
    }
    // Validate password strength
    if (!passwordRegex.test(password)) {
      return {
        message:
          "Password must have at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character (#?!@$%^&*-)",
        status: 400,
      };
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    return {
      message: "User created successfully",
      status: 201,
      data: data,
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      message: "Failed to register user",
      status: 500,
    };
  }
};

export const userLogin = async (req: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return {
        message: " email, or password is missing in request body",
        status: 400,
      };
    }
    const user = await db.user.findUnique({ where: { email: email } });

    if (!user) {
      return {
        message: "User not found",
        status: 400,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        message: "Invalid credentials",
        status: 400,
      };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      Bun.env.JwtSecret!,
      { expiresIn: "1h" }
    );
    return {
      message: "Login successful",
      token,
      status: 200,
    };
  } catch (error) {
    console.error("Error in user login", error);
    return {
      message: "Error in user login",
      status: 500,
    };
  }
};
