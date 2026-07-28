import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineDetector() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4" />
      You are offline. Some features may be unavailable.
    </div>
  );
}
