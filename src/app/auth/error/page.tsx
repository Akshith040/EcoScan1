'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    default: "An error occurred during authentication.",
    accessdenied: "You do not have permission to access this resource.",
    verification: "The verification link was invalid or has expired.",
    signin: "Try signing in with a different account.",
    oauthsignin: "Error occurred during OAuth sign in attempt.",
    oauthcallback: "Error occurred during OAuth callback.",
    oauthcreate: "Could not create an OAuth account.",
    emailcreate: "Could not create an email account.",
    callback: "Error occurred during callback.",
    credentialssignin: "The email or password you entered is incorrect.",
    sessionrequired: "Please sign in to access this page.",
  };

  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
        <p className="text-gray-600">{errorMessage}</p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}