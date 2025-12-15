import express from "express";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/be-common"
const app = express();

app.post("/v1/signup", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    };
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    return res.status(201).json({ message: "User registered successfully" });

})


app.post("v1/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    };

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

})




app.listen(3001, () => {
    console.log("Server started on port 3001");
})