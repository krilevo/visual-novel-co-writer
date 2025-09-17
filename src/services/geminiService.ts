import { GoogleGenAI, Type } from "@google/genai";
import { Character, PlotChapter, NovelSettings } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateConceptDetails = async (
  prompt: string,
  settings: NovelSettings
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following idea, expand it into a compelling visual novel concept. Describe the core premise, the main conflict, the setting, and the overall tone. The response should be well-structured and engaging. Idea: "${prompt}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating concept:", error);
    return "Failed to generate concept. Please check the console for details.";
  }
};

export const generateCharacterProfile = async (
  concept: string,
  characterRequest: string,
  existingCharacters: Character[],
  settings: NovelSettings
): Promise<Character> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a character designer for visual novels. Based on the novel concept: "${concept}", create a compelling and unique character profile. The user specifically requests: "${characterRequest}". Ensure the character is distinct from the existing characters: ${JSON.stringify(
      existingCharacters
    )}. The character needs a name, a detailed personality, a vivid appearance description, and a concise backstory.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The character's full name.",
          },
          personality: {
            type: Type.STRING,
            description:
              "A detailed description of the character's personality, quirks, and motivations.",
          },
          appearance: {
            type: Type.STRING,
            description:
              "A vivid description of the character's physical appearance, clothing, and style.",
          },
          backstory: {
            type: Type.STRING,
            description:
              "A concise summary of the character's history and background relevant to the story.",
          },
        },
        required: ["name", "personality", "appearance", "backstory"],
      },
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const generatePlotOutline = async (
  concept: string,
  characters: Character[],
  settings: NovelSettings
): Promise<PlotChapter[]> => {
  try {
    const characterDescriptions = characters
      .map((c) => `${c.name}: ${c.personality}`)
      .join("\n");
    const settingsDescription = `This novel ${
      settings.hasBranches
        ? "HAS a branching narrative with player choices"
        : "is a linear story with NO branching"
    }.`;
    const promptAddition = settings.hasBranches
      ? "Please also suggest key decision points for the player within the chapter summaries that could lead to different branches in the story."
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a detailed, chapter-by-chapter plot outline for a visual novel. The output should be a flat list of chapters.
            
            **Novel Concept:** ${concept}
            **Target Length:** Please create an outline with approximately ${settings.chapterCount} chapters in total.

            **Main Characters:**
            ${characterDescriptions}

            **Novel Settings:**
            ${settingsDescription}
            
            Each chapter should have a title and a summary detailing key events, character interactions, and plot advancements. The story should have a clear beginning, rising action, a climax, and a satisfying resolution spread across the chapters. ${promptAddition}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "An array of chapters that form the plot.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The title of the chapter.",
              },
              summary: {
                type: Type.STRING,
                description:
                  "A detailed summary of the events in this chapter.",
              },
            },
            required: ["title", "summary"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedChapters: Omit<PlotChapter, "id">[] = JSON.parse(jsonText);

    return parsedChapters.map((chapter) => ({
      ...chapter,
      id: `ch_${Date.now()}_${Math.random()}`,
    }));
  } catch (error) {
    console.error("Error generating outline:", error);
    throw new Error(
      "Failed to generate plot outline. Please check the console for details."
    );
  }
};

export const writeScene = async (
  concept: string,
  characters: Character[],
  outline: string,
  scenePrompt: string,
  settings: NovelSettings
): Promise<string> => {
  try {
    const characterList = characters.map((c) => c.name).join(", ");
    const promptAddition = settings.hasBranches
      ? 'Since this is a branching narrative, please include at least one clear player choice within this scene. Format the choice clearly, for example: [CHOICE: "Option A", "Option B"]'
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a scriptwriter for a visual novel. Write a complete scene based on the user's prompt.
            
            **Novel Concept:** ${concept}
            
            **Characters Available in Scene:** ${characterList}
            
            **Overall Plot Outline (for context):**
            ${outline}

            **Scene Prompt from User:** "${scenePrompt}"

            Write the scene in a script format. Use character names followed by a colon for dialogue. Use parentheses for narrative descriptions, actions, and setting details. Make the dialogue sharp and the descriptions vivid.
            
            ${promptAddition}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error writing scene:", error);
    return "Failed to write scene. Please check the console for details.";
  }
};

export const generateVisualNovelImage = async (
  prompt: string,
  type: "character" | "background",
  aspectRatio: string
): Promise<string> => {
  const fullPrompt = `High-quality digital art for a visual novel, anime-inspired style. ${
    type === "character"
      ? "Full-body character sprite on a pure white background, clean lines."
      : "Detailed background art, atmospheric lighting."
  } Description: ${prompt}`;

  try {
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes: string =
      response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(
      "Failed to generate image. The model may have refused the prompt."
    );
  }
};
