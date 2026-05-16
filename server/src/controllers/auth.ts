import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";
import { User, publicUser } from "../models/User.ts";
import { analysesUsedToday } from "../services/plan.ts";

const sign = (id: string) => jwt.sign({ id }, env.jwtSecret, { expiresIn: "30d" });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response) {
    const { name, email, password } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim() || !email.trim() || !password) {
        return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }
    if (!EMAIL.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email" });
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(400).json({ success: false, message: "An account with this email already exists" });

    const user = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ success: true, token: sign(user._id.toString()), user: publicUser(user, 0) });
}

export async function login(req: Request, res: Response) {
    const { email, password } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, token: sign(user._id.toString()), user: publicUser(user, analysesUsedToday(user)) });
}

export async function getUser(req: Request, res: Response) {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: publicUser(user, analysesUsedToday(user)) });
}
