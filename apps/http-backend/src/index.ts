import express from "express";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/be-common"
import { CreateUserSchema, loginUserSchema, CreateRoomSchema } from "@repo/common/types";
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

    await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ msg: "User created successfully" });

  } catch (error) {
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



app.post("v1/login", (req, res) => {
    const data = loginUserSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({
            msg: "Invalid data"
        })
    }
    const { email, password } = data.data;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.email !== email || user.password !== password) {
        return res.status(401).json({
            msg: "Invalid credentials"
        })
    }
    return res.status(200).json({
        msg: "Login success"
    })
})



app.post("/create", middleware, (req, res) => {

    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({
            msg: "Invalid data"
        })

    }
    const { name } = data.data;
    return res.status(200).json({
        roomId: 123,
        msg: "Create room success"
    })


})



app.listen(3001, () => {
    console.log("Server started on port 3001");
})