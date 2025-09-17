import React from 'react';
import { NovelSettings } from '../types';

interface SettingsEditorProps {
  settings: NovelSettings;
  setSettings: (settings: NovelSettings) => void;
}

const ToggleSwitch: React.FC<{
  id: string;
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ id, label, enabled, onChange }) => {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
      <span className="font-medium text-gray-300">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </label>
  );
};

const SettingsEditor: React.FC<SettingsEditorProps> = ({ settings, setSettings }) => {
    const handleSettingChange = (field: keyof NovelSettings, value: string | number | boolean) => {
        setSettings({ ...settings, [field]: value });
    };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white border-b-2 border-purple-400/50 pb-2">Novel Settings</h2>
      <p className="text-gray-400">Configure the core mechanics and structure of your visual novel. These settings will influence how the AI generates content in other tabs.</p>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-purple-300">Narrative Structure</h3>
        <ToggleSwitch
            id="branching-narrative"
            label="Branching Narrative"
            enabled={settings.hasBranches}
            onChange={(enabled) => handleSettingChange('hasBranches', enabled)}
        />
        <p className="text-sm text-gray-500 pl-4">
            Enable this to have the AI generate plot outlines with choice points and write scenes that include player decisions.
        </p>
      </div>

      <div className="space-y-6 pt-6 border-t border-gray-700/50">
        <h3 className="text-xl font-semibold text-purple-300">Story Details</h3>
        <div className="space-y-2">
            <label htmlFor="chapter-count" className="block text-sm font-medium text-gray-300">Target Chapter Count</label>
            <input
                id="chapter-count"
                type="number"
                value={settings.chapterCount}
                min="1"
                onChange={(e) => handleSettingChange('chapterCount', parseInt(e.target.value, 10) || 1)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
            />
            <p className="text-sm text-gray-500">
                The AI will aim to structure the plot outline around this many chapters.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;