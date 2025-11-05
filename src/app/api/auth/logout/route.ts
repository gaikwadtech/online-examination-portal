import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {

    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );

    // This is how you "delete" a cookie:
    // Set its value to empty and its expiration date to the past.
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Set expiry to a date in the past
      path: "/", 
    });

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}