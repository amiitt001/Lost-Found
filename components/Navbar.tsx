import React from 'react';
import { Search, MapPin, PlusCircle, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, user, onSignIn, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <Search className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Seek & Find AI</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              Browse
            </button>
            <button
              onClick={() => handleNavClick('report-lost')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'report-lost' ? 'bg-rose-50 text-rose-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              I Lost Something
            </button>
            <button
              onClick={() => handleNavClick('report-found')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'report-found' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              I Found Something
            </button>
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-gray-800">{user.displayName || 'User'}</div>
                  <div className="text-sm font-medium leading-none text-gray-500 mt-1">{user.email}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="px-5">
                <button
                  onClick={onSignIn}
                  className="block w-full px-4 py-2 text-center font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};