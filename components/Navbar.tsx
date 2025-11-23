import React from 'react';
import { Search, MapPin, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, user, onSignIn, onSignOut }) => {
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
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Browse
            </button>
            <button
              onClick={() => setCurrentView('report-lost')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'report-lost' ? 'text-rose-600 bg-rose-50' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              I Lost Something
            </button>
            <button
              onClick={() => setCurrentView('report-found')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'report-found' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              I Found Something
            </button>

            <div className="border-l border-gray-200 h-6 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};