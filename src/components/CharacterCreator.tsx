import React, { useState } from "react";
import { Character, NovelSettings } from "../types";
import { generateCharacterProfile } from "../services/geminiService";
import LoadingSpinner from "./LoadingSpinner";

interface CharacterCreatorProps {
  concept: string;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  settings: NovelSettings;
}

const CharacterCard: React.FC<{
  character: Character;
  onUpdate: (updatedCharacter: Character) => void;
  onDelete: () => void;
}> = ({ character, onUpdate, onDelete }) => {
  const handleChange = (field: keyof Omit<Character, "id">, value: string) => {
    onUpdate({ ...character, [field]: value });
  };

  const EditableField: React.FC<{
    label: string;
    fieldKey: keyof Omit<Character, "id" | "name">;
  }> = ({ label, fieldKey }) => (
    <div>
      <label className="font-semibold text-gray-300 block mb-1">{label}</label>
      <textarea
        value={character[fieldKey]}
        onChange={(e) => handleChange(fieldKey, e.target.value)}
        className="w-full h-48 p-2 bg-gray-900/70 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors resize-y text-gray-400 text-sm"
        rows={3}
        aria-label={`Edit ${label}`}
      />
    </div>
  );

  return (
    <div className="relative bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4 group transition-all duration-300 hover:border-purple-400/50">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-1 text-gray-500 rounded-full hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Delete character"
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

      <input
        value={character.name}
        onChange={(e) => handleChange("name", e.target.value)}
        className="w-full bg-transparent text-2xl font-bold text-purple-300 focus:outline-none focus:ring-0 border-0 p-0 pr-8"
        placeholder="Character Name"
        aria-label="Edit Character Name"
      />

      <EditableField label="Personality" fieldKey="personality" />
      <EditableField label="Appearance" fieldKey="appearance" />
      <EditableField label="Backstory" fieldKey="backstory" />
    </div>
  );
};

const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  concept,
  characters,
  setCharacters,
  settings,
}) => {
  const [request, setRequest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!concept) {
      setError("Please generate a concept first.");
      return;
    }
    if (!request) {
      setError("Please describe the character you want to create.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const newCharacterData = await generateCharacterProfile(
        concept,
        request,
        characters,
        settings
      );
      const newCharacter: Character = {
        ...newCharacterData,
        id: `char_${Date.now()}_${Math.random()}`,
      };
      setCharacters((prev) => [...prev, newCharacter]);
      setRequest("");
    } catch (e) {
      setError(
        "An error occurred while generating the character. The response may not be valid JSON."
      );
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterUpdate = (id: string, updatedCharacter: Character) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? updatedCharacter : char))
    );
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white border-b-2 border-purple-400/50 pb-2">
        Character Creation
      </h2>
      <p className="text-gray-400">
        Describe the kind of character you want to add to your story. After
        generating, you can click into any field on their card to edit their
        details.
      </p>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
        <input
          type="text"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="e.g., The cynical veteran detective who acts as the protagonist's mentor."
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
          disabled={!concept || isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={!concept || isLoading}
          className="w-full flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating Character..." : "Create Character"}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      {characters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onUpdate={(updatedCharacter) =>
                handleCharacterUpdate(char.id, updatedCharacter)
              }
              onDelete={() => handleDeleteCharacter(char.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterCreator;
