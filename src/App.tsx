import React, { useState } from "react";
import {
  Tab,
  Character,
  ImageAsset,
  Scene,
  PlotChapter,
  NovelSettings,
} from "./types";
import { TABS } from "./constants.tsx";
import TabButton from "./components/TabButton";
import ConceptCreator from "./components/ConceptCreator";
import CharacterCreator from "./components/CharacterCreator";
import OutlineCreator from "./components/OutlineCreator";
import SceneWriter from "./components/SceneWriter";
import ImageGenerator from "./components/ImageGenerator";
import SettingsEditor from "./components/SettingsEditor";
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SETTINGS);
  const [concept, setConcept] = useState<string>("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [outline, setOutline] = useState<PlotChapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [generatedImages, setGeneratedImages] = useState<ImageAsset[]>([]);
  const [settings, setSettings] = useState<NovelSettings>({
    hasBranches: false,
    chapterCount: 12,
  });

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SETTINGS:
        return <SettingsEditor settings={settings} setSettings={setSettings} />;
      case Tab.CONCEPT:
        return (
          <ConceptCreator
            concept={concept}
            setConcept={setConcept}
            settings={settings}
          />
        );
      case Tab.CHARACTERS:
        return (
          <CharacterCreator
            concept={concept}
            characters={characters}
            setCharacters={setCharacters}
            settings={settings}
          />
        );
      case Tab.OUTLINE:
        return (
          <OutlineCreator
            concept={concept}
            characters={characters}
            outline={outline}
            setOutline={setOutline}
            settings={settings}
          />
        );
      case Tab.SCENE:
        return (
          <SceneWriter
            concept={concept}
            characters={characters}
            outline={outline}
            scenes={scenes}
            setScenes={setScenes}
            settings={settings}
          />
        );
      case Tab.IMAGE:
        return (
          <ImageGenerator
            concept={concept}
            characters={characters}
            generatedImages={generatedImages}
            setGeneratedImages={setGeneratedImages}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-700/50 p-4 md:p-6 flex md:flex-col items-center justify-between md:justify-start">
        <div className="flex items-center space-x-3 mb-0 md:mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-purple-400"
          >
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.5a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533" />
            <path d="M12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.5a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533" />
          </svg>
          <h1 className="text-xl font-bold text-white hidden sm:block">
            VN Co-Writer
          </h1>
        </div>
        <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
          {TABS.map((tabInfo) => (
            <TabButton
              key={tabInfo.id}
              label={tabInfo.label}
              icon={tabInfo.icon}
              isActive={activeTab === tabInfo.id}
              onClick={() => setActiveTab(tabInfo.id)}
            />
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
