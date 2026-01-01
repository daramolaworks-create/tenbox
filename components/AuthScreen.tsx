import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Mail, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center pt-20 px-6 animate-in fade-in duration-500">

      {/* Brand Header */}
      <div className="mb-12 scale-110">
        <BrandLogo />
      </div>

      <div className="w-full max-w-sm">
        {/* Toggle Switch */}
        <div className="flex bg-[#E5E5EA] p-1 rounded-xl mb-8 relative">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[9px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSignUp ? 'left-[calc(50%+2px)]' : 'left-1'}`}
          />
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 relative z-10 py-1.5 text-[13px] font-bold text-center transition-colors ${!isSignUp ? 'text-black' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 relative z-10 py-1.5 text-[13px] font-bold text-center transition-colors ${isSignUp ? 'text-black' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Input Form Group */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-apple overflow-hidden mb-6">

            {/* Email Field */}
            <div className="flex items-center px-4 py-1 transition-colors hover:bg-gray-50/50">
              <div className="w-8 flex justify-center text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full py-3.5 pl-2 text-[17px] text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 outline-none"
              />
            </div>

            {/* Inset Divider */}
            <div className="ml-12 h-[1px] bg-[#E5E5EA]"></div>

            {/* Phone Field (Sign Up Only) */}
            {isSignUp && (
              <>
                <div className="flex items-center px-4 py-1 transition-colors hover:bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                  <div className="w-8 flex justify-center text-gray-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    required={isSignUp}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full py-3.5 pl-2 text-[17px] text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 outline-none"
                  />
                </div>
                <div className="ml-12 h-[1px] bg-[#E5E5EA]"></div>
              </>
            )}

            {/* Password Field */}
            <div className="flex items-center px-4 py-1 transition-colors hover:bg-gray-50/50">
              <div className="w-8 flex justify-center text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full py-3.5 pl-2 text-[17px] text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 outline-none"
              />
            </div>
          </div>

          {/* Main Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white font-bold text-[17px] py-4 rounded-full shadow-apple hover:shadow-apple-hover active:scale-[0.98] transition-all flex items-center justify-center relative overflow-hidden group"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Social Auth Separator */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#F5F5F7] text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full bg-black text-white font-bold text-[17px] py-3.5 rounded-full shadow-apple hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            <AppleLogo className="h-5 w-5 mr-2.5 fill-current mb-0.5" />
            Sign in with Apple
          </button>

          <button
            onClick={onLogin}
            className="w-full bg-white text-gray-900 font-bold text-[17px] py-3.5 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            <GoogleLogo className="h-5 w-5 mr-2.5" />
            Sign in with Google
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-10 text-center">
          <p className="text-[13px] text-gray-400">
            By continuing, you agree to our <a href="#" className="underline decoration-gray-300">Terms</a> and <a href="#" className="underline decoration-gray-300">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple SVG Components for Social Logos

const AppleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.12-1.15 1.76.15 2.87.89 3.53 1.84-2.87 1.62-2.4 5.74.88 7.14-.66 1.76-1.62 3.38-3.61 4.4zM12.03 7.25c-.15-2.2 1.84-4.12 3.82-4.26.22 2.42-2.28 4.33-3.82 4.26z" />
  </svg>
);

const GoogleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);