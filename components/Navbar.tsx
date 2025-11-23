import React from 'react';
import { Search, MapPin, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <Search className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Seek & Find AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setCurrentView('report-lost')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'report-lost' ? 'text-rose-600 bg-rose-50' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              I Lost Something
            </button>
            <button
              onClick={() => setCurrentView('report-found')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'report-found' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              I Found Something
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};