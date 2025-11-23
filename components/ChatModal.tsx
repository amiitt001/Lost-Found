import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { subscribeToMessages, sendMessage } from '../services/messageService';
import { User } from 'firebase/auth';

interface ChatModalProps {
  conversationId: string;
  itemTitle?: string;
  currentUser: User;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ conversationId, itemTitle, currentUser, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, (msgs) => setMessages(msgs));
    return () => unsub();
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(conversationId, currentUser.uid, text.trim());
      setText('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl mx-auto rounded-lg shadow-lg z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold">Messages about</h3>
            <div className="text-sm text-gray-600">{itemTitle}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X /></button>
        </div>

        <div className="p-4 h-96 overflow-y-auto bg-gray-50" id="chat-container">
          {messages.map(m => (
            <div key={m.id} className={`mb-3 ${m.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded-lg ${m.senderId === currentUser.uid ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border'}`}>
                {m.text}
                <div className="text-xs text-gray-400 mt-1">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} className="flex-1 border rounded-md px-3 py-2" placeholder="Type a message..." />
          <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
