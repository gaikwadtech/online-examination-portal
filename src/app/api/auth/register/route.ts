import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { name, email, password, phone = "", college = "", group = "" } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      phone: phone?.toString().trim?.() || "",
      college: college?.toString().trim?.() || "",
      group: group?.toString().trim?.() || "",
    });

    await newUser.save();

    const token = await createToken(newUser);

    const safeUser = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone || "",
      college: newUser.college || "",
      group: newUser.group || "",
    };

    const response = NextResponse.json(
      { message: "User registered successfully", user: safeUser },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
