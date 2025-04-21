import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

// Validation functions
const validateName = (name: string) => {
  if (!name || name.trim() === "") {
    return "Name is required";
  }
  if (!/^[A-Za-z]+$/.test(name)) {
    return "Name should contain only letters without spaces";
  }
  return null;
};

const validateEmail = (email: string) => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

const validatePassword = (password: string) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must include at least one lowercase letter";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must include at least one uppercase letter";
  }
  if (!/(?=.*[0-9])/.test(password)) {
    return "Password must include at least one number";
  }
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return "Password must include at least one special character";
  }
  return null;
};

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    // Validate inputs
    const nameError = validateName(name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    
    // Check if user already exists using Supabase admin client
    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error code
      console.error("Error checking for existing user:", lookupError);
      return NextResponse.json(
        { error: "Error checking for existing user" },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 12);
    
    // Create the user with Supabase admin client to bypass RLS
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating user:", createError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    
    // Return the user without the password
    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}