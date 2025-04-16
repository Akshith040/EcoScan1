"use client";

import { useState, useCallback } from "react";
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

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wasteType, setWasteType] = useState<string | null>(null);
  const [wasteDetails, setWasteDetails] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [recyclingInstructions, setRecyclingInstructions] = useState<string | null>(null);
  const [userDescription, setUserDescription] = useState<string>("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [showManualSubmit, setShowManualSubmit] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImageUrl(URL.createObjectURL(file));
    setShowManualSubmit(true);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

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

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const classificationResult = await classifyWaste({ photoUrl: base64String, contentType: blob.type });
          setWasteType(classificationResult.wasteType);
          setWasteDetails(classificationResult.details);
          setConfidence(classificationResult.confidence);

          const instructionsResult = await provideRecyclingInstructions({
            wasteType: classificationResult.wasteType,
            details: classificationResult.details,
          });
          setRecyclingInstructions(instructionsResult.recyclingInstructions);

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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10 bg-beige">
      <h1 className="text-4xl font-bold mb-8 text-green-800 fade-in">
        EcoSnap Recycle Guide
      </h1>

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
        </CardContent>
      </Card>
    </div>
  );
}
