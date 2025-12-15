import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

type ViewState = 'login' | 'signup' | 'verify_pending';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [viewState, setViewState] = useState<ViewState>('login');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email Validation Logic
  const validateEmail = (value: string) => {
    // Regex enforces @gmail.com domain
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    
    if (!value) {
      setEmailError('');
      return false;
    }
    
    if (!gmailRegex.test(value)) {
      setEmailError('Only @gmail.com addresses are allowed');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    
    // Validate immediately on input for both Login and Sign Up
    validateEmail(val);
  };

  const toggleMode = () => {
    setViewState(prev => prev === 'login' ? 'signup' : 'login');
    // Reset form state
    setEmailError('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict validation for both Login and Sign Up
    const isValid = validateEmail(email);
    if (!isValid) return; // Prevent submission

    setIsSubmitting(true);

    try {
      let response;
      
      if (viewState === 'signup') {
        // Call register API
        response = await authService.register({ fullName, email, password });
      } else {
        // Call login API
        response = await authService.login({ email, password });
      }

      setIsSubmitting(false);

      if (response.success) {
        // Login successful
        onLogin();
      } else {
        // Show error
        setEmailError(response.message || 'Authentication failed');
      }
    } catch (error) {
      setIsSubmitting(false);
      setEmailError('Network error. Please try again.');
    }
  };

  // Construct a verification link that points back to this app with a token
  const verificationLink = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?token=${btoa(email)}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          
          {/* View: Verification Pending */}
          {viewState === 'verify_pending' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Send className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                We need to verify ownership of <strong>{email}</strong>.
              </p>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
                <button 
                  onClick={() => {
                     // Open Gmail Compose with pre-filled body
                     const subject = encodeURIComponent("Activate your MARINOVA Account");
                     const body = encodeURIComponent(`Welcome to Marinova!\n\nPlease click the following link to verify your email address:\n${verificationLink}\n\nIf you did not request this, please ignore this email.`);
                     const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
                     window.open(gmailUrl, '_blank');
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3 shadow-lg shadow-red-600/20"
                >
                  <Mail className="w-4 h-4" />
                  Open Gmail & Send Link
                </button>
                
                <div className="text-left text-xs text-slate-400 space-y-1 pl-2 border-l-2 border-slate-700">
                   <p>1. Click button to open Gmail.</p>
                   <p>2. Send the verification email to yourself.</p>
                   <p>3. Click the link in your inbox to log in.</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-800/50">
                 <p className="mb-1">Developer Bypass (Testing only):</p>
                 <a href={verificationLink} className="text-cyan-600 hover:text-cyan-500 underline">
                    Click here to verify directly
                 </a>
              </div>

              <button 
                onClick={() => setViewState('signup')}
                className="text-slate-500 hover:text-slate-300 text-sm mt-6"
              >
                Back to Sign Up
              </button>
            </div>
          ) : (
            /* View: Login / Sign Up Form */
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
                  {viewState === 'login' ? 'Welcome Back' : 'Join MARINOVA'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {viewState === 'login' 
                    ? 'Sign in to access your ocean data dashboard' 
                    : 'Create an account to track global metrics'
                  }
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {viewState === 'signup' && (
                  <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-medium text-slate-300 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${emailError ? 'text-red-400' : 'text-slate-500'}`} />
                    <input 
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="user@gmail.com"
                      className={`w-full bg-[#0f172a] border rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        emailError 
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                          : 'border-slate-700 focus:ring-cyan-500 focus:border-transparent'
                      }`}
                      required
                    />
                  </div>
                  {/* Inline Error Message */}
                  {emailError && (
                    <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-400 animate-in slide-in-from-left-2 duration-200">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">{emailError}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !!emailError}
                  className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-6 ${
                    isSubmitting || !!emailError
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {viewState === 'login' ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {viewState === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-slate-700/50 pt-6">
                <p className="text-sm text-slate-400">
                  {viewState === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={toggleMode}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors ml-1"
                  >
                    {viewState === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;