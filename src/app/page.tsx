"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import type { DropzoneOptions } from "react-dropzone";
import { classifyWaste } from "@/services/classify-waste-service";
import { provideRecyclingInstructions } from "@/ai/flows/provide-recycling-instructions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RecyclingInstructions } from "@/components/recycling-instructions";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wasteType, setWasteType] = useState<string | null>(null);
  const [wasteDetails, setWasteDetails] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [recyclingInstructions, setRecyclingInstructions] = useState<string | null>(null);
  const [userDescription, setUserDescription] = useState<string>("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [showManualSubmit, setShowManualSubmit] = useState(false);
  const [isHistorySaved, setIsHistorySaved] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImageUrl(URL.createObjectURL(file));
    setShowManualSubmit(true);
    // Reset history saved flag when new image is uploaded
    setIsHistorySaved(false);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  // Save history entry
  const saveToHistory = async (recyclingInstructions: string | null, isUpdate: boolean = false) => {
    try {
      if (!session?.user?.id || !wasteType) {
        console.log("Cannot save history: missing user session or waste type");
        return;
      }

      console.log("Saving to history:", { wasteType, isUpdate, hasInstructions: !!recyclingInstructions });

      // Convert imageUrl (blob) to base64 for persistent storage
      let base64Image = null;
      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Read blob as base64
          const reader = new FileReader();
          base64Image = await new Promise<string | null>((resolve) => {
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error converting image to base64:", error);
        }
      }

      const historyData = {
        imageUrl: base64Image, // Store base64 instead of blob URL
        wasteType,
        confidence,
        userDescription: userDescription || null,
        recyclingInstructions,
      };

      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...historyData,
          isUpdate,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save history entry");
      } else {
        console.log("History saved successfully");
        setIsHistorySaved(true);
      }
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  // Reset the form
  const handleReset = () => {
    // Release URL object to prevent memory leaks
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    
    // Reset all state values
    setImageUrl(null);
    setWasteType(null);
    setWasteDetails(null);
    setConfidence(null);
    setRecyclingInstructions(null);
    setUserDescription("");
    setShowManualSubmit(false);
    setIsHistorySaved(false);
    
    toast({
      title: "Reset Complete",
      description: "You can now upload a new image for classification.",
    });
  };

  const handleClassification = async () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsClassifying(true);
    setWasteType(null);
    setWasteDetails(null);
    setConfidence(null);
    setRecyclingInstructions(null);
    setIsHistorySaved(false);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          // Step 1: Classify the waste
          const classificationResult = await classifyWaste({ photoUrl: base64String, contentType: blob.type });
          setWasteType(classificationResult.wasteType);
          setWasteDetails(classificationResult.details);
          setConfidence(classificationResult.confidence);

          // Step 2: Get recycling instructions
          const instructionsResult = await provideRecyclingInstructions({
            wasteType: classificationResult.wasteType,
            details: classificationResult.details,
          });
          setRecyclingInstructions(instructionsResult.recyclingInstructions);

          // Step 3: Save to history after successful classification
          // Even if recycling instructions are null, we still want to save the entry
          await saveToHistory(instructionsResult.recyclingInstructions);

          toast({
            title: "Classification Successful!",
            description: `Waste Type: ${classificationResult.wasteType}`,
          });
        } catch (error: any) {
          console.error("Classification error:", error);
          toast({
            title: "Error",
            description:
              error.message || "Failed to classify waste. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsClassifying(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error reading image:", error);
      toast({
        title: "Error",
        description: "Failed to read image. Please try again.",
        variant: "destructive",
      });
      setIsClassifying(false);
    }
  };

  const handleUserDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setUserDescription(event.target.value);
  };

  const handleSubmitUserDescription = async () => {
    setIsClassifying(true);
    setRecyclingInstructions(null);

    try {
      if (!wasteType || !wasteDetails) {
        toast({
          title: "Error",
          description: "Please classify the image first.",
          variant: "destructive",
        });
        return;
      }

      const instructionsResult = await provideRecyclingInstructions({
        wasteType: wasteType,
        details: `${wasteDetails}. User Description: ${userDescription}`,
      });
      setRecyclingInstructions(instructionsResult.recyclingInstructions);

      // Update history with new instructions
      await saveToHistory(instructionsResult.recyclingInstructions, true);

      toast({
        title: "Recycling Instructions Updated!",
        description: "Recycling instructions have been updated based on your description.",
      });
    } catch (error: any) {
      console.error("Error providing instructions:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to provide recycling instructions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Redirect to login if not authenticated (client-side check)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // If still loading the session, show a loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Only show the app UI if authenticated
  if (status === "authenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-beige">
        <Navbar />
        <div className="flex flex-col items-center justify-start flex-grow px-4 py-6">
          <Card className="w-full max-w-md bg-light-beige shadow-md rounded-lg overflow-hidden card-hover">
            <CardHeader className="py-4">
              <CardTitle className="text-lg font-semibold text-green-800">
                Upload Waste Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-300 ${
                  isDragActive ? "border-teal-500 bg-teal-50" : "border-green-500"
                }`}
              >
                <input {...getInputProps()} />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Uploaded waste"
                    className="max-h-full max-w-full object-contain fade-in"
                  />
                ) : (
                  <p className="text-green-700 fade-in">
                    {isDragActive
                      ? "Drop the image here..."
                      : "Drag 'n' drop an image here, or click to select files"}
                  </p>
                )}
              </div>
              {showManualSubmit && (
                <Button
                  onClick={handleClassification}
                  className="mt-4 btn-primary slide-up"
                  disabled={!imageUrl || isClassifying}
                >
                  {isClassifying ? (
                    <>
                      <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                      Classifying...
                    </>
                  ) : (
                    "Classify Waste"
                  )}
                </Button>
              )}

              {wasteType && confidence !== null && (
                <div className="mt-4 w-full slide-up">
                  <h2 className="text-xl font-semibold mb-2 text-green-800">
                    Classification Result:
                  </h2>
                  <div className="flex items-center space-x-2">
                    <p className="text-green-700">Waste Type:</p>
                    <Badge className="capitalize">{wasteType}</Badge>
                  </div>
                  <p className="text-green-700">
                    Confidence Level: {(confidence * 100).toFixed(2)}%
                  </p>
                </div>
              )}

              {wasteType && wasteDetails && (
                <>
                  <Separator className="my-4" />
                  <div className="mt-6 w-full">
                    <h2 className="text-xl font-semibold mb-2 text-green-800">
                      Additional Description:
                    </h2>
                    <Textarea
                      placeholder="Provide more details to improve the recycling instructions..."
                      className="w-full mb-3"
                      value={userDescription}
                      onChange={handleUserDescriptionChange}
                    />
                    <Button onClick={handleSubmitUserDescription} className="btn-primary" disabled={isClassifying}>
                      Update Instructions
                    </Button>
                  </div>
                </>
              )}

              {recyclingInstructions && (
                <div className="mt-4 w-full slide-up">
                  <h2 className="text-xl font-semibold mb-2 text-green-800">
                    Recycling Instructions:
                  </h2>
                  <RecyclingInstructions instructions={recyclingInstructions} />
                </div>
              )}
              
              {/* Reset button - only show after classification is complete */}
              {wasteType && !isClassifying && (
                <div className="mt-6 w-full flex justify-center">
                  <Button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    variant="destructive"
                  >
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Reset & Classify New Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // This shouldn't be reached because of the redirect, but just in case
  return null;
}
