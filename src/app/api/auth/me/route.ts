import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // This is an async function

export async function GET(request: Request) {
  try {
    // 1. Get the token from the cookies
    const cookieStore = await cookies(); // <-- THIS IS THE FIX
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    // 2. Verify the token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // 3. Find the user from the token's ID
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 4. Send the user's data
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}