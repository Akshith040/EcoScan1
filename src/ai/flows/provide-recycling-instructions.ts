'use server';
/**
 * @fileOverview Provides AI-generated recycling instructions based on the classified waste type and image details.
 *
 * - provideRecyclingInstructions - A function that provides recycling instructions.
 * - ProvideRecyclingInstructionsInput - The input type for the provideRecyclingInstructions function.
 * - ProvideRecyclingInstructionsOutput - The return type for the provideRecyclingInstructions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ProvideRecyclingInstructionsInputSchema = z.object({
  wasteType: z.string().describe('The classified type of waste material.'),
  details: z.string().describe('Detailed characteristics of the waste material derived from image analysis.'),
});

export type ProvideRecyclingInstructionsInput = z.infer<
  typeof ProvideRecyclingInstructionsInputSchema
>;

const ProvideRecyclingInstructionsOutputSchema = z.object({
  recyclingInstructions: z.string().describe('Instructions on how to recycle the waste material.'),
});

export type ProvideRecyclingInstructionsOutput = z.infer<
  typeof ProvideRecyclingInstructionsOutputSchema
>;

export async function provideRecyclingInstructions(
  input: ProvideRecyclingInstructionsInput
): Promise<ProvideRecyclingInstructionsOutput> {
  return provideRecyclingInstructionsFlow(input);
}

const provideRecyclingInstructionsPrompt = ai.definePrompt({
  name: 'provideRecyclingInstructionsPrompt',
  input: {
    schema: z.object({
      wasteType: z.string().describe('The classified type of waste material.'),
      details: z.string().describe('Detailed characteristics of the waste material derived from image analysis.'),
    }),
  },
  output: {
    schema: z.object({
      recyclingInstructions: z.string().describe('Instructions on how to recycle the waste material.'),
    }),
  },
  prompt: `You are an expert in recycling and waste management. 
Provide detailed recycling instructions for the following waste type, taking into account the specific details provided. 
Include information such as appropriate recycling bins (color), preparation steps, and any other relevant details for proper disposal.
Be specific and precise, considering the details provided.

Waste Type: {{{wasteType}}}
Details: {{{details}}}
`,
});

const provideRecyclingInstructionsFlow = ai.defineFlow<
  typeof ProvideRecyclingInstructionsInputSchema,
  typeof ProvideRecyclingInstructionsOutputSchema
>(
  {
    name: 'provideRecyclingInstructionsFlow',
    inputSchema: ProvideRecyclingInstructionsInputSchema,
    outputSchema: ProvideRecyclingInstructionsOutputSchema,
  },
  async input => {
    const {output} = await provideRecyclingInstructionsPrompt(input);
    return output!;
  }
);
