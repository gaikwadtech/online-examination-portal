import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Path to the admin user JSON file
const getAdminUserFilePath = () => {
  return path.join(process.cwd(), "src", "data", "adminUser.json");
};

// Read admin user data from JSON file
async function readAdminUser() {
  try {
    const filePath = getAdminUserFilePath();
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading admin user file:", error);
    // Return default admin user if file doesn't exist
    return {
      _id: "admin-fixed-id-12345",
      name: "Admin User",
      email: "admin@gmail.com",
      password: "admin123",
      role: "teacher",
      phone: "",
      college: "",
      registrationDate: new Date().toLocaleDateString("en-GB"),
      accountStatus: "Active",
      photo: "",
    };
  }
}

// Write admin user data to JSON file
async function writeAdminUser(data: any) {
  try {
    const filePath = getAdminUserFilePath();
    
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
    
    // Write the file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Admin user data saved successfully to:", filePath);
    return true;
  } catch (error) {
    console.error("Error writing admin user file:", error);
    throw error;
  }
}

// GET - Read admin user data
export async function GET() {
  try {
    const adminUser = await readAdminUser();
    
    // Remove password from response for security
    const { password, ...safeUser } = adminUser;
    
    console.log("GET /api/admin/user - returning:", safeUser);
    
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("GET /api/admin/user error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to read admin user data" },
      { status: 500 }
    );
  }
}

// POST - Update admin user data
export async function POST(req: NextRequest) {
  try {
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

    console.log("POST /api/admin/user - received body:", JSON.stringify(body, null, 2));

    // Read current admin user data
    const currentData = await readAdminUser();

    // Fields that can be updated
    const allowedFields = [
      "name",
      "email",
      "phone",
      "college",
      "group",
      "photo",
      "accountStatus",
      "registrationDate",
    ];

    // Build updated data
    const updatedData = { ...currentData };

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field];
        // Allow empty strings for optional fields
        if (typeof value === "string") {
          updatedData[field] = value.trim();
        } else if (value !== undefined && value !== null) {
          updatedData[field] = String(value).trim();
        }
      }
    }

    // Validate required fields
    if (!updatedData.name || !updatedData.name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!updatedData.email || !updatedData.email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("POST /api/admin/user - saving data:", JSON.stringify(updatedData, null, 2));

    // Write updated data to file
    await writeAdminUser(updatedData);

    // Return updated data (without password)
    const { password, ...safeUser } = updatedData;

    console.log("POST /api/admin/user - returning:", safeUser);

    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("POST /api/admin/user error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update admin user data" },
      { status: 500 }
    );
  }
}

// PATCH - Alternative update method
export async function PATCH(req: NextRequest) {
  // Reuse POST logic for PATCH
  return POST(req);
}