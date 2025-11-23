import React from 'react';
import { Item, MatchResult } from '../types';
import { X, ArrowRight, AlertCircle } from 'lucide-react';

interface MatchModalProps {
  targetItem: Item;
  matches: MatchResult[];
  allItems: Item[];
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ targetItem, matches, allItems, onClose }) => {
  // Helper to find item details by ID
  const getMatchItem = (id: string) => allItems.find(i => i.id === id);
  const [showContactFor, setShowContactFor] = React.useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">✨</span> AI Smart Match Results
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Analyzing potential matches for: <span className="font-medium text-indigo-600">{targetItem.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 bg-gray-50/30 flex-grow">
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No high-confidence matches found yet.</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Gemini analyzed the available items but didn't find a strong match. Check back later as more items are reported!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map((match, idx) => {
                const matchedItem = getMatchItem(match.itemId);
                if (!matchedItem) return null;
                const isContactVisible = showContactFor === match.itemId;

                return (
                  <div key={match.itemId} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Match details */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase mr-2 ${matchedItem.type === 'LOST' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                            {matchedItem.type}
                          </span>
                          <span className="text-sm text-gray-500">{matchedItem.date} • {matchedItem.location}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{matchedItem.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{matchedItem.description}</p>

                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">AI Reasoning</span>
                            <span className="text-xs font-bold text-indigo-600">{match.confidence}% Match</span>
                          </div>
                          <p className="text-sm text-indigo-900">{match.reasoning}</p>
                        </div>
                      </div>

                      {/* Image & Action */}
                      <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {matchedItem.imageUrl ? (
                            <img src={matchedItem.imageUrl} alt={matchedItem.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                          )}
                        </div>

                        {isContactVisible ? (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                            <div>
                              <span className="text-xs text-gray-500 block">Contact Name</span>
                              <span className="font-medium text-gray-900">{matchedItem.contactName}</span>
                            </div>
                            {matchedItem.contactEmail && (
                              <div>
                                <span className="text-xs text-gray-500 block">Email</span>
                                <a href={`mailto:${matchedItem.contactEmail}`} className="text-indigo-600 hover:underline break-all">
                                  {matchedItem.contactEmail}
                                </a>
                              </div>
                            )}
                            {matchedItem.contactPhone && (
                              <div>
                                <span className="text-xs text-gray-500 block">Phone</span>
                                <a href={`tel:${matchedItem.contactPhone}`} className="text-indigo-600 hover:underline">
                                  {matchedItem.contactPhone}
                                </a>
                              </div>
                            )}
                            <button
                              onClick={() => setShowContactFor(null)}
                              className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                              Hide Contact Info
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowContactFor(match.itemId)}
                            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                          >
                            Contact {matchedItem.contactName} <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};