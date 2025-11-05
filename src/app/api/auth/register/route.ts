import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs"; // For password hashing
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Connect to the database
    await dbConnect();

    // 2. Get data from the request body
    const { name, email, password } = await request.json();

    // 3. Validate that the email does not already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 } // 400 means Bad Request
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
      // The 'role' will automatically default to 'student'
      // as defined in our User.ts schema
    });

    await newUser.save();

    // 6. Send a success response
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 } // 201 means "Created"
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 } // 500 means Internal Server Error
    );
  }
}