"use client";

import React from 'react';

interface RecyclingInstructionsProps {
  instructions: string;
}

export const RecyclingInstructions: React.FC<RecyclingInstructionsProps> = ({ instructions }) => {
  const instructionSteps = instructions.split('\n').filter(step => step.trim() !== '');

  return (
    <div className="grid gap-4">
      {instructionSteps.map((step, index) => (
        <div key={index} className="flex items-start">
          <div className="mr-2 font-semibold text-green-800">{index + 1}.</div>
          <div className="text-green-700">{step}</div>
        </div>
      ))}
    </div>
  );
};
