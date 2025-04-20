"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-green-800 text-white py-3 px-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          EcoSnap Recycle Guide
        </Link>
        
        {session?.user && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <span>Hello, {session.user.name || session.user.email}</span>
            </div>
            <Button 
              variant="outline" 
              className="bg-transparent border-white hover:bg-green-700"
              onClick={() => router.push("/history")}
            >
              History
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent border-white hover:bg-green-700"
              onClick={() => router.push("/auth/login")}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}