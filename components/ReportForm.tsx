import React, { useState, useRef } from 'react';
import { ItemType, Item } from '../types';
import { CATEGORIES } from '../constants';
import { analyzeItemImage } from '../services/geminiService';
import { db } from '../services/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Upload, Sparkles, X } from 'lucide-react';

interface ReportFormProps {
  type: ItemType;
  onSubmit: (item: Omit<Item, 'id'>) => void;
  onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ type, onSubmit, onCancel }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    imageUrl: '' as string | null,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, imageUrl: base64String }));

      // Auto-trigger AI analysis
      triggerAIAnalysis(file, base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerAIAnalysis = async (file: File, base64Full: string) => {
    setIsAnalyzing(true);
    try {
      // Remove data URL prefix for Gemini
      const base64Data = base64Full.split(',')[1];
      const result = await analyzeItemImage(base64Data, file.type);

      setFormData(prev => ({
        ...prev,
        title: result.title,
        description: result.description,
        category: CATEGORIES.includes(result.category) ? result.category : 'Other',
        // Could also auto-detect location if EXIF data was processed, but skipping for simplicity
      }));
    } catch (error) {
      console.error("AI Analysis failed", error);
      // Fallback or user notification could go here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      type,
      ...formData,
      status: 'OPEN'
    } as any;

    // Keep existing local behavior (add to app state)
    onSubmit(payload);

    // Also attempt to persist to Firestore (best-effort)
    try {
      await addDoc(collection(db, 'reports'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to save report to Firestore', err);
      // Do not block the UI — app still uses local state. Optionally, show a toast in the future.
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`p-6 ${type === ItemType.LOST ? 'bg-rose-50 border-b border-rose-100' : 'bg-emerald-50 border-b border-emerald-100'}`}>
        <h2 className={`text-2xl font-bold ${type === ItemType.LOST ? 'text-rose-800' : 'text-emerald-800'}`}>
          Report {type === ItemType.LOST ? 'Lost' : 'Found'} Item
        </h2>
        <p className="text-gray-600 mt-1">Fill in the details to help {type === ItemType.LOST ? 'find your item' : 'return the item'}.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Image (Upload for AI Auto-fill)</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all relative
              ${imagePreview ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full h-64 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                  title="Remove image"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none">
                  <span className="text-white font-medium">Click to change</span>
                </div>
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm rounded-md">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    <span className="text-indigo-700 font-medium animate-pulse">Gemini is analyzing image...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          {isAnalyzing && !imagePreview && <p className="text-sm text-indigo-600 mt-2 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1" /> Analyzing...</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                placeholder="e.g. Blue Backpack"
              />
              {isAnalyzing && <Sparkles className="absolute right-2 top-2 w-5 h-5 text-indigo-400 animate-pulse" />}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="relative">
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="Describe the item in detail..."
            />
            {isAnalyzing && <Sparkles className="absolute right-2 top-2 w-5 h-5 text-indigo-400 animate-pulse" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Where was it lost/found?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input
              type="text"
              required
              value={formData.contactName}
              onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 ${type === ItemType.LOST
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};