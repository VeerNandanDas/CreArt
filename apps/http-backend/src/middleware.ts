import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/be-common";


export const middleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Set the userId on the request object
        req.userId = decoded.userId;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
