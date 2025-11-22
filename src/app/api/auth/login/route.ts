import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ADMIN_USER } from "@/data/adminUser";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // ============================
    // Admin login (hardcoded)
    // ============================
    if (role === "teacher") {
      if (email !== ADMIN_USER.email || password !== ADMIN_USER.password) {
        return NextResponse.json(
          { message: "Invalid admin credentials" },
          { status: 401 }
        );
      }

      const token = await createToken(ADMIN_USER as any);

      const response = NextResponse.json(
        {
          message: "Admin login successful",
          user: { name: ADMIN_USER.name, email: ADMIN_USER.email, role: "teacher" }, // ✅ return user info
        },
        { status: 200 }
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // ============================
    // Student login (DB)
    // ============================
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        { message: `This account is not a ${role}.` },
        { status: 403 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createToken(user);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: { name: user.name, email: user.email, role: user.role }, // ✅ return user info
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
