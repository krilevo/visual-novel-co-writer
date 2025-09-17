import React, { useState } from "react";
import { Character, PlotChapter, NovelSettings } from "../types";
import { generatePlotOutline } from "../services/geminiService";
import LoadingSpinner from "./LoadingSpinner";

interface OutlineCreatorProps {
  concept: string;
  characters: Character[];
  outline: PlotChapter[];
  setOutline: (outline: PlotChapter[]) => void;
  settings: NovelSettings;
}

const OutlineCreator: React.FC<OutlineCreatorProps> = ({
  concept,
  characters,
  outline,
  setOutline,
  settings,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!concept || characters.length === 0) {
      setError("Please generate a concept and at least one character first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await generatePlotOutline(concept, characters, settings);
      setOutline(result);
    } catch (e) {
      setError("An error occurred while generating the outline.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterChange = (
    chapterId: string,
    field: "title" | "summary",
    value: string
  ) => {
    setOutline(
      outline.map((ch) =>
        ch.id === chapterId ? { ...ch, [field]: value } : ch
      )
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white border-b-2 border-purple-400/50 pb-2">
        Plot Outline
      </h2>
      <p className="text-gray-400">
        With your concept and characters defined, you can now generate a
        chapter-by-chapter plot outline for your story.
      </p>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <button
          onClick={handleGenerate}
          disabled={!concept || characters.length === 0 || isLoading}
          className="w-full flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating Outline..." : "Generate Plot Outline"}
        </button>
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      {outline.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-2xl font-semibold text-purple-300">
            Generated Outline
          </h3>
          <p className="text-gray-400">
            The generated outline is now an interactive timeline. Click any
            title or summary to edit it.
          </p>

          <div className="relative mt-8 pl-8 border-l-2 border-gray-700/50">
            {outline.map((chapter, index) => (
              <div key={chapter.id} className="mb-8 last:mb-0 relative">
                <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-[9px] mt-2 ring-4 ring-gray-900"></div>

                <div className="pl-4">
                  <span className="font-bold text-sm text-gray-500">
                    CHAPTER {index + 1}
                  </span>
                  <input
                    value={chapter.title}
                    onChange={(e) =>
                      handleChapterChange(chapter.id, "title", e.target.value)
                    }
                    className="w-full bg-transparent font-semibold text-xl text-purple-300 focus:outline-none focus:ring-0 border-0 p-0 mb-1"
                    placeholder="Chapter Title"
                    aria-label="Edit Chapter Title"
                  />
                  <textarea
                    value={chapter.summary}
                    onChange={(e) =>
                      handleChapterChange(chapter.id, "summary", e.target.value)
                    }
                    className="w-full mt-1 p-2 bg-gray-800/60 border border-gray-700/50 rounded-md focus:ring-1 focus:ring-purple-500 focus:outline-none resize-y text-gray-400 text-sm"
                    rows={3}
                    placeholder="Chapter summary..."
                    aria-label="Edit Chapter Summary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlineCreator;
