import React, { useEffect, useState } from 'react';
import { subscribeToFlaggedMessages, resolveFlag, deleteMessage } from '../services/messageService';
import { Loader2, Trash2, Check } from 'lucide-react';

export const AdminModeration: React.FC = () => {
  const [flagged, setFlagged] = useState<any[] | null>(null);

  useEffect(() => {
    const unsub = subscribeToFlaggedMessages((msgs) => setFlagged(msgs));
    return () => unsub();
  }, []);

  if (flagged === null) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-bold mb-3">Flagged Messages</h3>
      {flagged.length === 0 && <div className="text-sm text-gray-500">No flagged messages.</div>}
      <div className="space-y-3">
        {flagged.map(m => (
          <div key={m.id} className="p-3 border rounded-md bg-red-50 flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-700 mb-1"><strong>Message:</strong> {m.text}</div>
              <div className="text-xs text-gray-500">Conversation: {m.conversationId || 'unknown'} • Flagged at: {m.flaggedAt?.toDate ? m.flaggedAt.toDate().toLocaleString() : ''}</div>
              {m.flagReason && <div className="text-xs text-gray-600 mt-1">Reason: {m.flagReason}</div>}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded-md flex items-center gap-2"
                onClick={() => resolveFlag(m.conversationId, m.id, 'admin')}
                title="Mark as reviewed"
              >
                <Check className="w-4 h-4" /> Resolve
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded-md flex items-center gap-2"
                onClick={() => deleteMessage(m.conversationId, m.id)}
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminModeration;
