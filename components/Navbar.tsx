import React from 'react';
import { Search, MapPin, PlusCircle, LogOut, User as UserIcon, Menu, X, Heart, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';
import NotificationToggle from './NotificationToggle';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, user, onSignIn, onSignOut, isAdmin = false }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const LazyPaymentModal = React.lazy(() => import('./PaymentModal').then(module => ({ default: module.PaymentModal })));

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <Search className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Seek & Find AI
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Donate
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Home
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setCurrentView('report-lost')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'report-lost'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Report Lost
                </button>
                <button
                  onClick={() => setCurrentView('report-found')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'report-found'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Report Found
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'admin'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    Admin
                  </button>
                )}

                <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-3">
                    <NotificationToggle user={user} />
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="h-8 w-8 rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <button
                      onClick={onSignOut}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onSignIn}
                className="ml-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="mr-2 p-2 text-pink-600 bg-pink-50 rounded-full"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => handleNavClick('home')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Home
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('report-lost')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Report Lost Item
                </button>
                <button
                  onClick={() => handleNavClick('report-found')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Report Found Item
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Admin Dashboard
                  </button>
                )}

                <div className="pt-4 pb-4 border-t border-gray-200 mt-2">
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
                </div>
              </>
            ) : (
              <button
                onClick={() => { onSignIn(); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <React.Suspense fallback={null}>
        {isPaymentModalOpen && (
          <LazyPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
          />
        )}
      </React.Suspense>
    </nav>
  );
};