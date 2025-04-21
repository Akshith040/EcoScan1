'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Update password strength indicators on password change
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    });
  }, [formData.password]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      general: ""
    };

    // Name validation - no spaces, only letters
    if (!/^[A-Za-z]+$/.test(formData.name)) {
      newErrors.name = "Name should contain only letters without spaces";
      valid = false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Password must include uppercase, lowercase, number and special character";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear individual field error on change
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: "", email: "", password: "", general: "" });
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Call our API endpoint to register the user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(prev => ({ ...prev, general: data.error || "Failed to create account" }));
        setIsLoading(false);
        return;
      }

      // Show success message and redirect to login
      alert("Account created successfully! Please login with your credentials.");
      router.push("/auth/login");
    } catch (error) {
      console.error("Signup error:", error);
      setErrors(prev => ({ ...prev, general: "An unexpected error occurred" }));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get started with our app
          </p>
        </div>

        {errors.general && (
          <div className="p-3 text-sm font-medium text-red-500 bg-red-50 rounded-md">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 mt-1 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
                errors.name && "border-red-300"
              )}
              placeholder="JohnDoe"
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 mt-1 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
                errors.email && "border-red-300"
              )}
              placeholder="name@example.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 mt-1 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
                errors.password && "border-red-300"
              )}
              placeholder="••••••••"
              required
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
            
            {/* Password strength indicators */}
            <div className="mt-2 space-y-1.5">
              <p className="text-xs font-medium text-gray-700">Password must contain:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`text-xs flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`mr-1 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordStrength.hasMinLength ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </div>
                <div className={`text-xs flex items-center ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`mr-1 ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordStrength.hasUppercase ? '✓' : '○'}
                  </span>
                  Uppercase letter
                </div>
                <div className={`text-xs flex items-center ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`mr-1 ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordStrength.hasLowercase ? '✓' : '○'}
                  </span>
                  Lowercase letter
                </div>
                <div className={`text-xs flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`mr-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordStrength.hasNumber ? '✓' : '○'}
                  </span>
                  Number
                </div>
                <div className={`text-xs flex items-center ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`mr-1 ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordStrength.hasSpecial ? '✓' : '○'}
                  </span>
                  Special character
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign up"}
          </button>

          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}