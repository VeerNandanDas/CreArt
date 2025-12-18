import express from "express";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/be-common";
import {
  CreateUserSchema,
  loginUserSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const app = express();
app.use(express.json());

app.post("/v1/signup", async (req, res) => {
  try {
    const data = CreateUserSchema.parse(req.body);

    const { name, email, password } = data;

    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   const user =  await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ 
      msg: "User created successfully",
      userId: user.id

     });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.errors,
      });
    }

    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

app.post("/v1/login", async (req, res) => {
  try {
    const data = loginUserSchema.parse(req.body);

    const { email, password } = data;

    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      msg: "Login success",
      token : token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.errors,
      });
    }
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

app.post("/create", middleware, async (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({
      msg: "Invalid data",
    });
  }

  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "Unauthorized",
    });
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: data.data.name,
        adminId: userId,
      },
    });

    return res.status(201).json({
      message : "Room created successfully",
      id: room.id,

    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      msg: "Already exists",
    });
  }
});

app.listen(3001, () => {
  console.log("Server started on port 3001");
});
