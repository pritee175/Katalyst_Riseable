import { NextRequest, NextResponse } from "next/server";

// Mock database - in production, use a real database
const users: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, name, email, password, phone } = body;

    // Validate required fields
    if (!role || !name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      role,
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
      // Role-specific data
      ...(role === "student" && {
        disabilityType: body.disabilityType,
        assistiveNeeds: body.assistiveNeeds,
      }),
      ...(role === "tutor" && {
        expertise: body.expertise,
        experience: body.experience,
        qualifications: body.qualifications,
      }),
      ...(role === "company" && {
        companyName: body.companyName,
        industry: body.industry,
        location: body.location,
        companySize: body.companySize,
        description: body.description,
      }),
    };

    // In production, hash the password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);

    users.push(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
