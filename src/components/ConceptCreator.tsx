import React, { useState } from "react";
import { generateConceptDetails } from "../services/geminiService";
import { NovelSettings } from "../types";
import LoadingSpinner from "./LoadingSpinner";

interface ConceptCreatorProps {
  concept: string;
  setConcept: (concept: string) => void;
  settings: NovelSettings;
}

const ConceptCreator: React.FC<ConceptCreatorProps> = ({
  concept,
  setConcept,
  settings,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a basic idea or theme.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await generateConceptDetails(prompt, settings);
      setConcept(result);
    } catch (e) {
      setError("An error occurred while generating the concept.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white border-b-2 border-purple-400/50 pb-2">
        Novel Concept
      </h2>
      <p className="text-gray-400">
        Start by defining the core idea of your visual novel. What is the genre?
        Who is the protagonist? What is the central conflict? Enter a few
        sentences below and let the AI expand on it.
      </p>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A detective story set in a cyberpunk city where memories can be bought and sold."
          className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating..." : "Generate Concept"}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      {concept && (
        <div className="mt-6 space-y-4">
          <h3 className="text-2xl font-semibold text-purple-300">
            Generated Concept
          </h3>
          <p className="text-gray-400">
            The generated concept below is a starting point. Feel free to edit
            it directly in the text area.
          </p>
          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full h-96 p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors text-gray-300 whitespace-pre-wrap font-sans text-base leading-relaxed"
            aria-label="Editable concept text"
          />
        </div>
      )}
    </div>
  );
};

export default ConceptCreator;
