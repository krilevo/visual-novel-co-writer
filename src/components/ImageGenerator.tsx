import React, { useState, useEffect } from "react";
import { Character, ImageAsset } from "../types";
import { generateVisualNovelImage } from "../services/geminiService";
import LoadingSpinner from "./LoadingSpinner";

interface ImageGeneratorProps {
  concept: string;
  characters: Character[];
  generatedImages: ImageAsset[];
  setGeneratedImages: React.Dispatch<React.SetStateAction<ImageAsset[]>>;
}

const aspectRatios = ["16:9", "4:3", "1:1", "3:4", "9:16"];

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  concept,
  characters,
  generatedImages,
  setGeneratedImages,
}) => {
  const [prompt, setPrompt] = useState("");
  const [imageType, setImageType] = useState<"character" | "background">(
    "character"
  );
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = concept || characters.length > 0;

  useEffect(() => {
    setAspectRatio(imageType === "character" ? "9:16" : "16:9");
  }, [imageType]);

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please provide a prompt for the image.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const imageUrl = await generateVisualNovelImage(
        prompt,
        imageType,
        aspectRatio
      );
      const newImage: ImageAsset = {
        id: new Date().toISOString(),
        url: imageUrl,
        prompt: prompt,
        aspectRatio: aspectRatio,
      };
      setGeneratedImages((prev) => [newImage, ...prev]);
      setPrompt("");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred during image generation.");
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setGeneratedImages((prev) => prev.filter((image) => image.id !== id));
  };

  const autofillPrompt = (char: Character) => {
    setImageType("character");
    setPrompt(
      `A portrait of ${char.name}. Appearance: ${char.appearance}. Personality: ${char.personality}`
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white border-b-2 border-purple-400/50 pb-2">
        Image Generator
      </h2>
      <p className="text-gray-400">
        Create visuals for your novel. Generate character sprites or background
        art. Click a character to autofill their description.
      </p>

      {characters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="self-center mr-2 text-gray-300">
            Autofill from character:
          </span>
          {characters.map((char) => (
            <button
              key={char.name}
              onClick={() => autofillPrompt(char)}
              className="px-3 py-1 bg-gray-700 text-sm text-gray-200 rounded-full hover:bg-purple-500 hover:text-white transition-colors"
            >
              {char.name}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setImageType("character")}
            className={`w-full py-2 rounded-lg transition-colors ${
              imageType === "character"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Character Sprite
          </button>
          <button
            onClick={() => setImageType("background")}
            className={`w-full py-2 rounded-lg transition-colors ${
              imageType === "background"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Background
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  aspectRatio === ar
                    ? "bg-purple-600 text-white font-semibold"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            imageType === "character"
              ? "e.g., A young female mage with silver hair, wearing blue robes, holding a glowing staff."
              : "e.g., A tranquil fantasy forest with giant, glowing mushrooms at twilight."
          }
          className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating Image..." : "Generate Image"}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {generatedImages.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
            style={{
              aspectRatio: (image.aspectRatio || "9/16").replace(":", "/"),
            }}
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-sm text-gray-300 truncate">{image.prompt}</p>
            </div>
            <button
              onClick={() => handleDeleteImage(image.id)}
              className="absolute top-2 right-2 p-1.5 text-gray-300 bg-black/40 rounded-full hover:bg-red-500/80 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300"
              aria-label="Delete image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGenerator;
