import React, { useState } from "react";
import { Character, Scene, PlotChapter, NovelSettings } from "../types";
import { writeScene } from "../services/geminiService";
import LoadingSpinner from "./LoadingSpinner";

interface SceneWriterProps {
  concept: string;
  characters: Character[];
  outline: PlotChapter[];
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  settings: NovelSettings;
}

const formatOutlineForPrompt = (outline: PlotChapter[]): string => {
  if (!outline || outline.length === 0) return "No outline provided.";
  return outline
    .map(
      (ch, index) => `Chapter ${index + 1}: ${ch.title}\nSummary: ${ch.summary}`
    )
    .join("\n\n");
};

const SceneCard: React.FC<{
  scene: Scene;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}> = ({ scene, onUpdate, onDelete }) => {
  return (
    <div className="relative bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4 group transition-all duration-300 hover:border-purple-400/50">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-1 text-gray-500 rounded-full hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Delete scene"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>
      <div className="space-y-2">
        <p className="font-semibold text-purple-300">Prompt:</p>
        <p className="text-gray-400 text-sm italic">"{scene.prompt}"</p>
      </div>
      <textarea
        value={scene.content}
        onChange={(e) => onUpdate(e.target.value)}
        className="w-full h-96 p-4 bg-gray-900/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors text-gray-300 whitespace-pre-wrap font-sans text-base leading-relaxed"
        aria-label="Editable scene text"
      />
    </div>
  );
};

const SceneWriter: React.FC<SceneWriterProps> = ({
  concept,
  characters,
  outline,
  scenes,
  setScenes,
  settings,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = concept && characters.length > 0 && outline.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError(
        "Please complete the Concept, Characters, and Outline sections first."
      );
      return;
    }
    if (!prompt) {
      setError("Please describe the scene you want to write.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const outlineString = formatOutlineForPrompt(outline);
      const result = await writeScene(
        concept,
        characters,
        outlineString,
        prompt,
        settings
      );
      const newScene: Scene = {
        id: `scene_${Date.now()}_${Math.random()}`,
        prompt: prompt,
        content: result,
      };
      setScenes((prev) => [newScene, ...prev]);
      setPrompt("");
    } catch (e) {
      setError("An error occurred while writing the scene.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScene = (id: string, content: string) => {
    setScenes((prev) =>
      prev.map((scene) => (scene.id === id ? { ...scene, content } : scene))
    );
  };

  const handleDeleteScene = (id: string) => {
    setScenes((prev) => prev.filter((scene) => scene.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white border-b-2 border-purple-400/50 pb-2">
        Scene Writer
      </h2>
      <p className="text-gray-400">
        Describe a specific scene you want to write. The AI will use your
        concept, characters, and outline to generate dialogue and descriptions.
        Each generated scene will be added to a list below, where you can edit
        it.
      </p>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., The protagonist meets their mentor for the first time in a rainy, neon-lit alleyway."
          className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
          disabled={!canGenerate || isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Writing Scene..." : "Add New Scene"}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      {scenes.length > 0 && (
        <div className="mt-6 space-y-6">
          <h3 className="text-2xl font-semibold text-purple-300">
            Written Scenes
          </h3>
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onUpdate={(content) => handleUpdateScene(scene.id, content)}
              onDelete={() => handleDeleteScene(scene.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SceneWriter;
