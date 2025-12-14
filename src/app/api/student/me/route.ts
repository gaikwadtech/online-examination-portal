import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";

// Helper to extract User ID from a JWT Token (without verifying signature here)
function getUserIdFromToken(token: string): string | null {
  try {
    // 1. If the token is exactly 24 hex chars, it's a raw MongoDB ID, not a JWT
    if (token.length === 24 && /^[0-9a-fA-F]{24}$/.test(token)) {
      return token;
    }

    // 2. If it looks like a JWT (header.payload.signature), decode the payload
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], "base64").toString();
      const payload = JSON.parse(payloadJson);
      return payload.id || payload._id || payload.userId || payload.sub || null;
    }

    return null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

function getUserIdFromReq(req: NextRequest): string | null {
  // 1. Prefer explicit header (sent by frontend from localStorage)
  const headerId = req.headers.get("x-user-id");
  if (headerId) {
    const cleanId = headerId.replace(/['"]+/g, '').trim();
    console.log("Got user ID from header:", cleanId);
    return cleanId;
  }

  // 2. Cookie fallback
  const token = 
    req.cookies.get("token")?.value || 
    req.cookies.get("userId")?.value || 
    req.cookies.get("user")?.value;

  if (token) {
    const tokenId = getUserIdFromToken(token);
    console.log("Got user ID from token:", tokenId);
    return tokenId;
  }

  console.log("No user ID found in request");
  return null;
}

function serializeUser(doc: any) {
  if (!doc) return null;
  
  let obj: any;
  try {
    obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  } catch {
    obj = { ...doc };
  }

  // Convert _id to string
  if (obj._id && typeof obj._id !== "string") {
    obj._id = String(obj._id);
  }

  // Convert registrationDate to ISO string
  if (obj.registrationDate) {
    try {
      obj.registrationDate = new Date(obj.registrationDate).toISOString();
    } catch {}
  } else if (obj.createdAt) {
    // Fallback: use createdAt as registrationDate if registrationDate is not set
    try {
      obj.registrationDate = new Date(obj.createdAt).toISOString();
    } catch {}
  }

  // Convert createdAt to ISO string
  if (obj.createdAt && typeof obj.createdAt !== "string") {
    try {
      obj.createdAt = new Date(obj.createdAt).toISOString();
    } catch {}
  }

  // Convert updatedAt to ISO string
  if (obj.updatedAt && typeof obj.updatedAt !== "string") {
    try {
      obj.updatedAt = new Date(obj.updatedAt).toISOString();
    } catch {}
  }

  // Remove password from response
  if (obj.password) delete obj.password;

  // Remove mongoose internal fields
  if (obj.__v !== undefined) delete obj.__v;

  return obj;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const userId = getUserIdFromReq(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: missing user id" }, 
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid ID Format received: ${userId}`);
      return NextResponse.json(
        { error: "Invalid user id format" }, 
        { status: 400 }
      );
    }

    const userDoc = await User.findById(userId).select("-password").lean();
    
    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    const serialized = serializeUser(userDoc);
    console.log("GET /api/student/me - returning user:", serialized?._id);

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("GET /api/student/me error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const userId = getUserIdFromReq(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: missing user id" }, 
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user id format" }, 
        { status: 400 }
      );
    }

    // Check if user exists first
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    console.log("PATCH /api/student/me - received body:", JSON.stringify(body, null, 2));

    // Fields that are allowed to be updated
    const allowed = ["name", "email", "phone", "college", "group", "photo", "accountStatus"];
    const updates: Record<string, any> = {};
    
    for (const key of allowed) {
      // Check if the key exists in the body (even if value is empty string)
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const value = body[key];
        // Allow empty strings for optional fields, but ensure they are strings
        if (typeof value === 'string') {
          updates[key] = value;
        } else if (value !== undefined && value !== null) {
          updates[key] = String(value);
        }
      }
    }
    
    console.log("PATCH /api/student/me - updates to apply:", JSON.stringify(updates, null, 2));

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" }, 
        { status: 400 }
      );
    }

    // Validate required fields
    if (updates.name !== undefined && !updates.name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" }, 
        { status: 400 }
      );
    }

    if (updates.email !== undefined && !updates.email.trim()) {
      return NextResponse.json(
        { error: "Email cannot be empty" }, 
        { status: 400 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: updates.email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use by another account" }, 
          { status: 400 }
        );
      }
    }

    // Perform the update
    const updatedDoc = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).select("-password");

    if (!updatedDoc) {
      return NextResponse.json(
        { error: "Failed to update user" }, 
        { status: 500 }
      );
    }

    const serialized = serializeUser(updatedDoc);
    console.log("PATCH /api/student/me - update successful, returning:", serialized?._id);
    console.log("Updated fields:", {
      phone: serialized?.phone,
      college: serialized?.college,
      group: serialized?.group,
    });

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("PATCH /api/student/me error:", err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" }, 
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      return NextResponse.json(
        { error: messages.join(', ') }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: err?.message || "Server error" }, 
      { status: 500 }
    );
  }
}
