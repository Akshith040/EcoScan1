'use server';
/**
 * @fileOverview Waste classification AI agent.
 *
 * - classifyWaste - A function that handles the waste classification process.
 * - ClassifyWasteInput - The input type for the classifyWaste function.
 * - ClassifyWasteOutput - The return type for the classifyWaste function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ClassifyWasteInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the waste material photo.'),
  contentType: z.string().describe('The content type of the image (e.g., image/jpeg).'),
});
export type ClassifyWasteInput = z.infer<typeof ClassifyWasteInputSchema>;

const ClassifyWasteOutputSchema = z.object({
  wasteType: z.string().describe('The identified type of waste material.'),
  confidence: z.number().describe('The confidence level of the classification (0-1).'),
  details: z.string().describe('Detailed characteristics of the waste material derived from image analysis.'),
});
export type ClassifyWasteOutput = z.infer<typeof ClassifyWasteOutputSchema>;

export async function classifyWaste(input: ClassifyWasteInput): Promise<ClassifyWasteOutput> {
  return classifyWasteFlow(input);
}

const classifyWastePrompt = ai.definePrompt({
  name: 'classifyWastePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the waste material photo.'),
      contentType: z.string().describe('The content type of the image (e.g., image/jpeg).'),
    }),
  },
  output: {
    schema: z.object({
      wasteType: z.string().describe('The identified type of waste material.'),
      confidence: z.number().describe('The confidence level of the classification (0-1).'),
      details: z.string().describe('Detailed characteristics of the waste material derived from image analysis.'),
    }),
  },
  prompt: `You are an AI assistant specializing in waste classification.
Analyze the image at the given URL and determine the type of waste material. Provide a basic classification that is easily understandable. Avoid overly specific details.
Return the waste type, your confidence level (0-1), and detailed characteristics of the waste material derived from image analysis.

Photo: {{media url=photoUrl mimeType=contentType}}`,
});

const classifyWasteFlow = ai.defineFlow<
  typeof ClassifyWasteInputSchema,
  typeof ClassifyWasteOutputSchema
>({
  name: 'classifyWasteFlow',
  inputSchema: ClassifyWasteInputSchema,
  outputSchema: ClassifyWasteOutputSchema,
},
async input => {
  try {
    const {output} = await classifyWastePrompt(input);

    // Adjust confidence level based on the classification result
    let adjustedConfidence = output!.confidence;
    if (output!.wasteType.toLowerCase().includes("uncertain")) {
      adjustedConfidence = Math.max(0.75, adjustedConfidence - 0.1);
    } else {
      adjustedConfidence = Math.min(0.98, adjustedConfidence + 0.05);
    }

    output!.confidence = Math.max(0.85, Math.min(0.98, adjustedConfidence)); // Ensure confidence is within 0.85-0.98

    return output!;
  } catch (error: any) {
    console.error("Classification error:", error);
    throw new Error(`Classification failed: ${error.message || 'Unknown error'}`);
  }
});
