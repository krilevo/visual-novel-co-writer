
import React from 'react';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center space-x-3 w-full text-left p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900";
  const activeClasses = "bg-purple-500/20 text-purple-300";
  const inactiveClasses = "text-gray-400 hover:bg-gray-700/50 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

export default TabButton;
