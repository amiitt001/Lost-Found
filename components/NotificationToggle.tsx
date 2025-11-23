import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { registerFcmTokenForUser, removeFcmTokenForUser } from '../services/notificationService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Props { user: User | null }

export const NotificationToggle: React.FC<Props> = ({ user }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) {
        setToken(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!mounted) return;
        setToken(snap.exists() ? (snap.data() as any).fcmToken || null : null);
      } catch (err) {
        console.error('Failed to read user token', err);
      }
    };
    load();
    return () => { mounted = false };
  }, [user]);

  const enable = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const t = await registerFcmTokenForUser(user.uid);
      setToken(t || null);
    } finally { setLoading(false); }
  };

  const disable = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await removeFcmTokenForUser(user.uid);
      setToken(null);
    } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {token ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">Notifications On</span>
          <button className="text-sm text-gray-600 hover:underline" onClick={disable} disabled={loading}>Disable</button>
        </div>
      ) : (
        <button className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded text-sm" onClick={enable} disabled={loading}>Enable Notifications</button>
      )}
    </div>
  );
};

export default NotificationToggle;
