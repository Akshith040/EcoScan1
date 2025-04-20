"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RecyclingInstructions } from "@/components/recycling-instructions";
import { Icons } from "@/components/icons";

type HistoryItem = {
  id: string;
  imageUrl: string | null;
  wasteType: string | null;
  confidence: number | null;
  userDescription: string | null;
  recyclingInstructions: string | null;
  createdAt: string;
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
      console.log("History data:", data); // Debug log to check the response
      setHistoryItems(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format date safely with fallback
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Invalid Date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format confidence percentage safely with fallback
  const formatConfidence = (confidence: number | null) => {
    if (confidence === null || confidence === undefined) return "Unknown";
    
    // Check if confidence is already in percentage format (0-100)
    if (confidence > 1) {
      return `${confidence.toFixed(2)}%`;
    }
    // Convert decimal format (0-1) to percentage
    return `${(confidence * 100).toFixed(2)}%`;
  };

  // If still loading the session, show a loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-beige">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Only show the history UI if authenticated
  if (status === "authenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-beige">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Your Recycling History</h1>
          
          {historyItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">You haven't scanned any items yet.</p>
              <Button 
                onClick={() => router.push("/")}
                className="mt-4 bg-green-700 hover:bg-green-800"
              >
                Go Scan Something!
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {historyItems.map((item) => (
                <Card key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                  <CardHeader className="bg-green-50 py-3">
                    <CardTitle className="text-lg font-semibold text-green-800 flex justify-between items-center">
                      <span>{item.wasteType || "Unknown"}</span>
                      <Badge className="capitalize ml-2">
                        {formatDate(item.createdAt)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {item.imageUrl && (
                      <div className="mb-4 h-40 flex justify-center">
                        <img 
                          src={item.imageUrl} 
                          alt={`${item.wasteType} image`} 
                          className="max-h-full object-contain rounded-md"
                        />
                      </div>
                    )}
                    
                    {item.confidence !== null && (
                      <p className="text-green-700 mb-2">
                        Confidence: {formatConfidence(item.confidence)}
                      </p>
                    )}
                    
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpand(item.id)}
                      className="w-full justify-between items-center mb-2 bg-green-50 hover:bg-green-100"
                    >
                      <span>Details</span>
                      <Icons.chevronDown className={`h-4 w-4 transition-transform ${expandedItems[item.id] ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {expandedItems[item.id] && (
                      <div className="mt-3">
                        {item.userDescription && (
                          <>
                            <h3 className="font-semibold text-green-800 mb-1">Your Description:</h3>
                            <p className="text-gray-700 mb-3">{item.userDescription}</p>
                          </>
                        )}
                        
                        {item.recyclingInstructions && (
                          <>
                            <Separator className="my-3" />
                            <h3 className="font-semibold text-green-800 mb-1">Recycling Instructions:</h3>
                            <RecyclingInstructions instructions={item.recyclingInstructions} />
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // This shouldn't be reached because of the redirect, but just in case
  return null;
}