import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ItemCard } from './components/ItemCard';
import { ReportForm } from './components/ReportForm';
import { MatchModal } from './components/MatchModal';
import { CATEGORIES } from './constants';
import { Item, ItemType, MatchResult } from './types';
import { findSmartMatches } from './services/geminiService';
import { getItemsFromFirestore, addItemToFirestore, updateItemStatus, deleteItemFromFirestore } from './services/itemService';
import { signInWithGoogle, signOut, subscribeToAuthChanges } from './services/authService';
import { User } from 'firebase/auth';
import { Loader2, Filter, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  // Matching State
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [targetItemForMatch, setTargetItemForMatch] = useState<Item | null>(null);

  // Fetch items on mount
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const fetchedItems = await getItemsFromFirestore();
        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Handle adding new items
  const handleAddItem = async (newItem: Omit<Item, 'id'>) => {
    try {
      const itemWithUser = {
        ...newItem,
        userId: user?.uid, // Attach user ID if logged in
      };
      const addedItem = await addItemToFirestore(itemWithUser);
      setItems(prev => [addedItem, ...prev]);
      setCurrentView('home');
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to save item. Please try again.");
    }
  };

  // Handle deleting items
  const handleDeleteItem = async (item: Item) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    try {
      await deleteItemFromFirestore(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("Failed to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      alert("Failed to sign out.");
    }
  };

  // Handle resolving items
  const handleResolveItem = async (item: Item) => {
    if (!confirm("Are you sure you want to mark this item as resolved?")) return;

    try {
      await updateItemStatus(item.id, 'RESOLVED');
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'RESOLVED' } : i));
    } catch (error) {
      console.error("Failed to resolve item:", error);
      alert("Failed to update item status. Please try again.");
    }
  };

  // Trigger AI Matching
  const handleSmartMatch = async (item: Item) => {
    setTargetItemForMatch(item);
    setIsMatching(true);

    try {
      const response = await findSmartMatches(item, items);
      // Sort by confidence
      const sortedMatches = (response.matches || []).sort((a, b) => b.confidence - a.confidence);
      setMatchResults(sortedMatches);
    } catch (error) {
      console.error("Match failed", error);
      setMatchResults([]);
    } finally {
      setIsMatching(false);
    }
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = filterCategory === 'All' || item.category === filterCategory;
    const typeMatch = filterType === 'All' || item.type === filterType;
    return categoryMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <>
            {/* Hero / Header Section */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Lost something? Found something?
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Community-driven lost and found powered by AI. Report items and let our smart matching system connect you.
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value={ItemType.LOST}>Lost Items</option>
                  <option value={ItemType.FOUND}>Found Items</option>
                </select>

                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="text-sm text-gray-500">
                Showing {filteredItems.length} items
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                  const isOwner = user && item.userId === user.uid;
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onSmartMatch={handleSmartMatch}
                      onResolve={isOwner ? handleResolveItem : undefined}
                      onDelete={isOwner ? handleDeleteItem : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No items found matching your criteria.</p>
                <button
                  onClick={() => { setFilterCategory('All'); setFilterType('All'); }}
                  className="mt-4 text-indigo-600 font-medium hover:underline flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {currentView === 'report-lost' && (
          <ReportForm
            type={ItemType.LOST}
            onSubmit={handleAddItem}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'report-found' && (
          <ReportForm
            type={ItemType.FOUND}
            onSubmit={handleAddItem}
            onCancel={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Matching Loading / Modal Overlay */}
      {(isMatching || targetItemForMatch) && (
        <div className="fixed inset-0 z-50">
          {isMatching ? (
            // Loading State
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-400" />
              <h3 className="text-xl font-bold">Gemini is thinking...</h3>
              <p className="text-gray-300 mt-2">Comparing "{targetItemForMatch?.title}" against database.</p>
            </div>
          ) : (
            // Results State
            <MatchModal
              targetItem={targetItemForMatch!}
              matches={matchResults}
              allItems={items}
              onClose={() => setTargetItemForMatch(null)}
            />
          )}
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Seek & Find AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;