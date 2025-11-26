'use client';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
  };
}

export default function UserAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: loginData.email,
      preferences: {
        language: 'en-US',
        theme: 'light',
        notifications: true
      }
    };
    setUser(mockUser);
    setIsLoggedIn(true);
    setShowLogin(false);
    setLoginData({ email: '', password: '' });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: '2',
      name: signupData.name,
      email: signupData.email,
      preferences: {
        language: 'en-US',
        theme: 'light',
        notifications: true
      }
    };
    setUser(mockUser);
    setIsLoggedIn(true);
    setShowLogin(false);
    setSignupData({ name: '', email: '', password: '' });
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn && user) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-[#aa1b1b] mb-6 text-center">User Profile</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-lg text-gray-800">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-lg text-gray-800">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">User ID</label>
                <p className="text-sm text-gray-500 font-mono">{user.id}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Preferences</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Language</label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Theme</label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="notifications" defaultChecked={user.preferences.notifications} />
                <label htmlFor="notifications" className="text-sm font-semibold text-gray-600">
                  Enable Notifications
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <button className="bg-[#aa1b1b] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#8a1515] transition">
            Save Changes
          </button>
          <button 
            onClick={handleLogout}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h3 className="text-3xl font-bold text-[#aa1b1b] mb-6 text-center">User Authentication</h3>
      
      {!showLogin ? (
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#aa1b1b]/10 to-[#8a1515]/10 rounded-xl p-8 mb-6">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-lg text-gray-600 mb-6">
              Sign in to save your preferences, conversation history, and access personalized features.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-[#aa1b1b] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#8a1515] transition"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setShowLogin(true); setIsSignup(true); }}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Save conversation history</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Personalized settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Cross-device sync</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="flex mb-6">
            <button 
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 px-4 text-center font-semibold ${!isSignup ? 'bg-[#aa1b1b] text-white' : 'bg-gray-200 text-gray-600'} rounded-l-lg transition`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 px-4 text-center font-semibold ${isSignup ? 'bg-[#aa1b1b] text-white' : 'bg-gray-200 text-gray-600'} rounded-r-lg transition`}
            >
              Sign Up
            </button>
          </div>

          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aa1b1b]"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aa1b1b]"
                  placeholder="Enter your password"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#aa1b1b] text-white py-3 rounded-lg font-semibold hover:bg-[#8a1515] transition"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aa1b1b]"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aa1b1b]"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aa1b1b]"
                  placeholder="Create a password"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#aa1b1b] text-white py-3 rounded-lg font-semibold hover:bg-[#8a1515] transition"
              >
                Sign Up
              </button>
            </form>
          )}

          <button 
            onClick={() => setShowLogin(false)}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}