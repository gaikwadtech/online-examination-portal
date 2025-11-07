import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth"; // <-- 1. ADD THIS IMPORT

export async function POST(request: Request) {
  try {
    // 1. Connect to the database
    await dbConnect();

    // 2. Get data from the request body
    const { name, email, password, role } = await request.json(); 

    // 3. Validate that the email does not already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 } 
      );
    }

    // 4. Implement bcrypt password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    await newUser.save();

    // 6. CREATE THE TOKEN (This is where your line goes)
    const token = await createToken(newUser);

    // 7. Send a success response AND set the cookie
    const response = NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response; // <-- Return the new response with the cookie

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}