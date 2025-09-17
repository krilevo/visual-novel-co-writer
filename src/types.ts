export enum Tab {
  CONCEPT = 'CONCEPT',
  SETTINGS = 'SETTINGS',
  CHARACTERS = 'CHARACTERS',
  OUTLINE = 'OUTLINE',
  SCENE = 'SCENE',
  IMAGE = 'IMAGE',
}

export interface NovelSettings {
  hasBranches: boolean;
  chapterCount: number;
}

export interface Character {
  id: string;
  name: string;
  personality: string;
  appearance: string;
  backstory: string;
}

export interface ImageAsset {
  id:string;
  url: string;
  prompt: string;
  aspectRatio: string;
}

export interface Scene {
  id: string;
  prompt: string;
  content: string;
}

export interface PlotChapter {
  id: string;
  title: string;
  summary: string;
}