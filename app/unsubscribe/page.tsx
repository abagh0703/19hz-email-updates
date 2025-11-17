'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const sigParam = searchParams.get('sig');
    
    if (!tokenParam || !sigParam) {
      setError('Invalid unsubscribe link. Missing required parameters.');
    } else {
      setToken(tokenParam);
      setSig(sigParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async () => {
    if (!token || !sig) {
      setError('Invalid unsubscribe link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/unsubscribe/${token}.${sig}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setUnsubscribed(true);
      } else {
        setError(data.message || 'Failed to unsubscribe. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {unsubscribed ? '👋 Goodbye' : '📭 Unsubscribe'}
            </h1>
            <p className="text-purple-200">
              HardstyleEvents
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-100 p-4 rounded-lg mb-6">
              <p className="font-medium">⚠️ Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Success State */}
          {unsubscribed && (
            <div className="text-center">
              <div className="bg-green-500/20 border border-green-400/30 text-green-100 p-6 rounded-lg mb-6">
                <p className="text-lg font-medium mb-2">✅ Successfully Unsubscribed</p>
                <p className="text-sm">
                  You will no longer receive weekly event notifications from us.
                </p>
              </div>
              <p className="text-purple-200 text-sm mb-4">
                Changed your mind?
              </p>
              <a
                href="/"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
              >
                Resubscribe
              </a>
            </div>
          )}

          {/* Unsubscribe Confirmation */}
          {!unsubscribed && !error && token && sig && (
            <div className="text-center">
              <p className="text-purple-100 mb-6">
                Are you sure you want to unsubscribe from weekly hardstyle event notifications?
              </p>
              <p className="text-purple-300 text-sm mb-8">
                You can always resubscribe later by visiting our homepage.
              </p>
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-4"
              >
                {loading ? 'Unsubscribing...' : 'Yes, Unsubscribe Me'}
              </button>
              <a
                href="/"
                className="block text-purple-300 hover:text-purple-100 underline text-sm transition"
              >
                No, take me back home
              </a>
            </div>
          )}

          {/* Invalid Link State */}
          {!token || !sig ? (
            !error && (
              <div className="text-center">
                <p className="text-purple-200 mb-6">
                  This unsubscribe link appears to be invalid or incomplete.
                </p>
                <a
                  href="/"
                  className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Go to Homepage
                </a>
              </div>
            )
          ) : null}
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300 text-sm mt-8">
          HardstyleEvents - Weekly Hardstyle Event Alerts
        </p>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Loading...</h1>
            </div>
          </div>
        </div>
      </main>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}


