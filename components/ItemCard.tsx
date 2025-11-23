import React from 'react';
import { Item, ItemType } from '../types';
import { MapPin, Calendar, Tag, CheckCircle2, Trash2 } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onSmartMatch: (item: Item) => void;
  onResolve?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onMessage?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSmartMatch, onResolve, onDelete, onMessage }) => {
  const isLost = item.type === ItemType.LOST;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${isLost ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
          {item.type}
        </div>
        {item.status === 'RESOLVED' && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 mr-2" /> RESOLVED
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-gray-400" />
            <span>{item.category}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{item.date}</span>
          </div>
        </div>

        <button
          onClick={() => onSmartMatch(item)}
          className="w-full mt-auto py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
          Find Potential Matches
        </button>

        {item.status !== 'RESOLVED' && onResolve && (
          <button
            onClick={() => onResolve(item)}
            className="w-full mt-2 py-2 px-4 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as {isLost ? 'Found' : 'Returned'}
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(item)}
            className="w-full mt-2 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Item
          </button>
        )}

        {onMessage && (
          <button
            onClick={() => onMessage(item)}
            className="w-full mt-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
};