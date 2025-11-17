"use client";

import { useState, useEffect } from 'react';
import { getAllLocations } from '@/lib/locations';

export default function Home() {
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const locations = getAllLocations();

  // Preload the background image on mount so it appears promptly on first paint
  useEffect(() => {
    const img = new Image();
    // start eager load
    try {
      img.src = '/defqon_background.jpg';
      // help the browser decode the image off-main-thread when supported
      // @ts-ignore
      if ('decoding' in img) img.decoding = 'async';
    } catch (e) {
      // ignore — best-effort preload only
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, location }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setEmail('');
        setLocation('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen relative"
      style={{
        backgroundColor: '#000', // fallback so there's no white flash while loading
        backgroundImage: "url(/defqon_background.jpg)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section   */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Never Miss a <span className="bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Hardstyle</span> Event
          </h1>
          <p className="text-xl md:text-2xl text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Get weekly email alerts for hard events in your area
          </p>
          <p className="text-lg text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {/* Powered by <a href="https://19hz.info/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white font-semibold">19hz.info</a> */}
          </p>
        </div>

        {/* Subscription Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Subscribe Now
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/30 border-2 border-white/40 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent-end)] focus:border-[var(--accent-end)] transition shadow-lg"
                />
              </div>

              {/* Location Dropdown */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/30 border-2 border-white/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-end)] focus:border-[var(--accent-end)] transition appearance-none cursor-pointer shadow-lg"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" disabled className="bg-gray-900 text-white">
                    Select your location
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.name} value={loc.name} className="bg-gray-900 text-white">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] hover:from-[var(--accent-start)] hover:to-[var(--accent-end)] text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Subscribing...' : 'Get Weekly Updates'}
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/20 border border-green-400/30 text-green-100'
                    : 'bg-red-500/20 border border-red-400/30 text-red-100'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Privacy Note */}
            <p className="mt-8 text-sm text-white/80 text-center">
              🔒 We respect your privacy. Unsubscribe anytime. No spam, just hardstyle.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Weekly Digests</h3>
            <p className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              One email every Monday with that week’s events sourced from 19hz.info
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Genre Focused</h3>
            <p className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Hardstyle, hardcore, uptempo, and frenchcore
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Multi-Location</h3>
            <p className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Coverage across major cities in North America
            </p>
          </div>
        </div>
       

        {/* Example Email Preview (styled like the provided image, using red accents) */}
        <div className="max-w-5xl mx-auto mt-16">
          {/* Section intro (separate from the email preview card) */}
          <div className="px-8 mb-4">
            <p className="text-center text-white text-2xl md:text-3xl font-semibold">Example Email</p>
          </div>
          <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white/95">
            {/* Top banner */}
            <div className="px-8 py-8 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white">
              <h3 className="text-4xl md:text-5xl font-extrabold">Weekly hardstyle Events</h3>
              <p className="mt-3 text-base opacity-90">San Francisco Bay Area / Northern California - Week of 2025-10-13</p>
            </div>

            {/* Content area */}
            <div className="px-8 py-8">
              <p className="mb-6 text-gray-800 text-lg">Found <strong>2</strong> hardstyle events happening in the next week!</p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead>
                    <tr className="bg-[var(--accent-start)] text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date/Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Event @ Venue</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Tags</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Price | Age</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Organizers</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-6 align-top text-sm w-40">
                        <div className="font-medium">Fri: Oct 17</div>
                        <div className="text-gray-500 text-xs">(8pm)</div>
                      </td>
                      <td className="px-6 py-6 align-top text-sm">The Funeral of Hello Kitty: Flapjack, Tidy, 9aradox, Emytnw0rb, Queermom, Auggie, Harabaz, Ketamine Princess, Dark-O @ TBA (East Bay)</td>
                      <td className="px-6 py-6 align-top text-sm">hardcore, hyperpop, hardstyle, uptempo, dubstep, bass music</td>
                      <td className="px-6 py-6 align-top text-sm">$20 b4 9pm / $25 | 18+</td>
                      <td className="px-6 py-6 align-top text-sm">Rave Jesus, East Bay Raves</td>
                      <td className="px-6 py-6 align-top text-sm">2025/10/17</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-6 align-top text-sm w-40">
                        <div className="font-medium">Fri: Oct 17</div>
                        <div className="text-gray-500 text-xs">(9pm)</div>
                      </td>
                      <td className="px-6 py-6 align-top text-sm">Lil Texas @ The Rink Studios (Sacramento)</td>
                      <td className="px-6 py-6 align-top text-sm">hardstyle, hardcore, uptempo</td>
                      <td className="px-6 py-6 align-top text-sm">$33.99 | 18+</td>
                      <td className="px-6 py-6 align-top text-sm">Subphonic Events, Vital</td>
                      <td className="px-6 py-6 align-top text-sm">2025/10/17</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                Example preview. Actual weekly emails are tailored to your selected location and are sent each Monday.
              </div>
            </div>
          </div>
        </div>

        {/* Contact / questions note (email obfuscated to reduce scraping) */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-sm text-white/80">
            Have questions or comments? Reach me at <span className="font-mono">abagh0703 [at] gmail [dot] com</span>
          </p>
        </div>
      </div>
    </main>
  );
}


