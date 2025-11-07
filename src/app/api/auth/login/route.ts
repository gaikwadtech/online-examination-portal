import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth"; 
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    
    await dbConnect();

    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 } // 401 Unauthorized
      );
    }

    // 4. Compare passwords using bcrypt.compare()
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
  
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createToken(user);

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS
      maxAge: 60 * 60 * 24 * 7, // 7 days (matches token expiry)
      path: "/", // Available to all pages
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