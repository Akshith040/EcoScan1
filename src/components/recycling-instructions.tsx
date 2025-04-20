"use client";

import React from 'react';

interface RecyclingInstructionsProps {
  instructions: string;
}

export const RecyclingInstructions: React.FC<RecyclingInstructionsProps> = ({ instructions }) => {
  // Process the instructions to handle different formatting patterns
  const processInstructions = (rawInstructions: string) => {
    // Split by newlines or numbered patterns (1., 2., etc.)
    const steps = rawInstructions
      .split(/\n+|\r\n+|(?=\d+\.\s)/)
      .map(step => step.trim())
      .filter(step => step.length > 0);

    // Process each step to clean up markdown formatting
    return steps.map(step => {
      // Remove leading asterisks, dashes, or numbers used as bullet points
      return step.replace(/^[\*\-•]|\d+\.\s+/g, '').trim();
    });
  };

  const instructionSteps = processInstructions(instructions);

  return (
    <div className="bg-green-50 rounded-lg p-4 shadow-inner">
      <h3 className="font-semibold text-green-800 mb-3 text-lg">Follow these steps:</h3>
      <ol className="space-y-3 list-none pl-0">
        {instructionSteps.map((step, index) => (
          <li key={index} className="bg-white rounded-md p-3 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-medium mr-3">
                {index + 1}
              </div>
              <div className="text-green-800 leading-relaxed">
                {step}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
