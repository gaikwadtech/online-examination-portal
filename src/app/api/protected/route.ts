import { NextResponse } from "next/server";
export async function GET(request: Request) {  
  return NextResponse.json(
    { message: "Welcome, Teacher! You can see this secret data." },
    { status: 200 }
  );
}