import { minLength, z } from "zod";


export const CreateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});




export const loginUserSchema = z.object({
    email : z.email(),
    password : z.string(),

})

export const CreateRoomSchema = z.object({
   name : z.string().min(3, "Room name must be at least 3 characters long"),

})