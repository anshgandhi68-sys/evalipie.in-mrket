import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Eye, EyeOff, X, Shield, ShoppingBag, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialMode
}) => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, signIn, signUp } = useAuth();
  
  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const handleClose = propOnClose || closeAuthModal;

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode || authModalMode || 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        await signUp({ name, email, password, role });
        setSuccessMsg('Account created successfully! Welcome to Evalipie.');
        setTimeout(() => handleClose(), 800);
      } else {
        if (!email.trim()) throw new Error('Please enter your email address.');
        if (!password) throw new Error('Please enter your password.');

        await signIn({ email, password });
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => handleClose(), 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (targetRole: 'CUSTOMER' | 'ADMIN') => {
    if (targetRole === 'ADMIN') {
      setEmail('admin@evalipie.in');
      setPassword('Admin@123456');
      setRole('ADMIN');
      setMode('signin');
    } else {
      setEmail('customer@evalipie.in');
      setPassword('Customer@123');
      setRole('CUSTOMER');
      setMode('signin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Editorial Photography matching Reference Image 2 */}
        <div className="hidden md:block md:w-1/2 relative bg-[#F5EFEB] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1200&auto=format&fit=crop&q=85"
            alt="Evalipie Shopping Community"
            className="w-full h-full object-cover object-center filter saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-300 mb-1">Evalipie Marketplace</span>
            <h3 className="text-2xl font-serif font-bold leading-tight">Every Shop. One Intelligent Platform.</h3>
            <p className="text-sm text-gray-200 mt-2 font-sans">
              Discover verified products with direct delivery and live inventory assurance.
            </p>
          </div>
        </div>

        {/* Right Side: Form matching Reference Image 2 */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white">
          {/* Brand Wordmark */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#105B55] tracking-tight">
              Evalipie<span className="text-[#167D73]">.in</span>
            </h2>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {mode === 'signup' 
                ? 'Join thousands of shoppers and discover neighbourhood stores' 
                : 'Sign in to access your orders, wishlist and saved addresses'}
            </p>
          </div>

          {/* Quick Demo Credential Pills */}
          <div className="mb-4 flex items-center justify-center gap-2 text-xs">
            <span className="text-gray-400">Quick Fill:</span>
            <button
              type="button"
              onClick={() => handleDemoFill('CUSTOMER')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors text-[11px] font-medium"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors text-[11px] font-medium"
            >
              Demo Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dominik Doudny"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167D73] focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eormi-dashboard@email.com"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167D73] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167D73] focus:border-transparent pr-10 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection (Customer vs Admin) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      role === 'CUSTOMER'
                        ? 'border-[#105B55] bg-emerald-50 text-[#105B55]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Shopper
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      role === 'ADMIN'
                        ? 'border-[#105B55] bg-emerald-50 text-[#105B55]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Administrator
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#105B55] hover:bg-[#0c4742] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Create an Account' : 'Sign In'}
            </button>
          </form>

          {/* Social Sign In Matching Reference Image 2 */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail('customer@evalipie.in');
                setPassword('Customer@123');
                setMode('signin');
              }}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Sign Up with Google
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('customer@evalipie.in');
                setPassword('Customer@123');
                setMode('signin');
              }}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 fill-[#1DA1F2]" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
              </svg>
              Sign Up with Twitter
            </button>
          </div>

          {/* Toggle between Sign Up and Sign In */}
          <div className="mt-6 text-center text-xs text-gray-500">
            {mode === 'signup' ? (
              <p>
                Already have an Account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-[#105B55] hover:text-[#167D73] font-semibold underline ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-[#105B55] hover:text-[#167D73] font-semibold underline ml-1"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
