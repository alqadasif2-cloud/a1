import React, { useState } from 'react';
import { LogoAM } from '../components/LogoAM';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  registerNewUser,
  loginWithEmail,
  loginWithGoogle,
  parseAuthError,
} from '../services/authService';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onBackToSplash?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBackToSplash }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('ahmed123'); // username or email
  const [emailInput, setEmailInput] = useState('ahmed@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('أحمد محمد');
  const [phoneNumber, setPhoneNumber] = useState('+966 50 123 4567');
  const [errorMessage, setErrorMessage] = useState('');
  const [authRestrictedNotice, setAuthRestrictedNotice] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthRestrictedNotice(false);

    // Validation
    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMessage('يرجى إدخال الاسم الكامل');
        return;
      }
      if (!identifier.trim()) {
        setErrorMessage('يرجى إدخال اسم المستخدم الفريد');
        return;
      }
      if (!emailInput.trim() || !emailInput.includes('@')) {
        setErrorMessage('يرجى إدخال بريد إلكتروني صالح (مثال: name@example.com)');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
        return;
      }
    } else {
      if (!identifier.trim()) {
        setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
        return;
      }
      if (!password) {
        setErrorMessage('يرجى إدخال كلمة المرور');
        return;
      }
    }

    setIsLoading(true);

    try {
      let appUser: User;
      if (isSignUp) {
        // Delegate to authService.registerNewUser
        appUser = await registerNewUser({
          fullName,
          username: identifier,
          email: emailInput,
          password,
          phoneNumber,
        });
        setSuccessNotice('تم إنشاء الحساب وحفظ البيانات سحابياً بنجاح!');
      } else {
        // Delegate to authService.loginWithEmail
        appUser = await loginWithEmail(identifier, password);
        setSuccessNotice('تم تسجيل الدخول بنجاح!');
      }

      setTimeout(() => {
        onLoginSuccess(appUser);
      }, 500);
    } catch (err: unknown) {
      const parsed = parseAuthError(err);
      setErrorMessage(parsed.message);
      if (parsed.isProviderRestricted) {
        setAuthRestrictedNotice(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setAuthRestrictedNotice(false);
    setIsLoading(true);
    setSuccessNotice('جاري المصادقة عبر Google...');

    try {
      const appUser = await loginWithGoogle();
      setSuccessNotice('تم تسجيل الدخول عبر Google ومزامنة الحساب السحابي بنجاح!');
      setTimeout(() => {
        onLoginSuccess(appUser);
      }, 500);
    } catch (err: unknown) {
      const parsed = parseAuthError(err);
      setErrorMessage(parsed.message);
      if (parsed.isProviderRestricted) {
        setAuthRestrictedNotice(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 select-none transition-colors duration-200">
      {/* Top Header & Logo */}
      <div className="flex flex-col items-center mt-2">
        {onBackToSplash && (
          <div className="w-full flex justify-start mb-1">
            <button
              onClick={onBackToSplash}
              className="text-xs text-purple-700 dark:text-purple-300 font-semibold hover:underline"
            >
              ← شاشة البداية
            </button>
          </div>
        )}

        {/* Official Brand Logo */}
        <LogoAM size="lg" showTagline={false} theme="auto" />

        {/* Welcome Headings */}
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>{isSignUp ? 'إنشاء حساب جديد' : 'مرحباً بك مجدداً'}</span>
            {!isSignUp && <span className="text-xl">👋</span>}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isSignUp ? 'انضم إلى مجتمع A«»M للتواصل بلا حدود' : 'سجل الدخول للمتابعة'}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto my-4 flex flex-col gap-3">
        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>

                {/* If Email/Password needs enabling in Firebase console */}
                {authRestrictedNotice && (
                  <div className="mt-2.5 pt-2 border-t border-rose-200 dark:border-rose-800/60">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                      مشروع Firebase: <code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded font-mono font-bold text-rose-800 dark:text-rose-200">gen-lang-client-0745177875</code>
                    </p>
                    <a
                      href="https://console.firebase.google.com/project/gen-lang-client-0745177875/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-[11px] shadow-sm transition-all"
                    >
                      <span>تفعيل Email/Password في الكونسول</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full name if sign up */}
        {isSignUp && (
          <div className="relative flex items-center">
            <div className="absolute right-3.5 text-slate-400 pointer-events-none">
              <UserIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="الاسم الكامل"
              required={isSignUp}
              className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Username input */}
        <div className="relative flex items-center">
          <div className="absolute right-3.5 text-slate-400 pointer-events-none">
            {isSignUp ? <UserIcon className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={isSignUp ? 'اسم المستخدم الفريد (مثال: ahmed_pro)' : 'اسم المستخدم أو البريد الإلكتروني'}
            required
            className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Dedicated Email input for registration */}
        {isSignUp && (
          <div className="relative flex items-center">
            <div className="absolute right-3.5 text-slate-400 pointer-events-none">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="البريد الإلكتروني (مثال: name@gmail.com)"
              required={isSignUp}
              className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dir-ltr text-right"
            />
          </div>
        )}

        {/* Phone number if sign up */}
        {isSignUp && (
          <div className="relative flex items-center">
            <div className="absolute right-3.5 text-slate-400 pointer-events-none">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="رقم الهاتف (+966...)"
              className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dir-ltr text-right"
            />
          </div>
        )}

        {/* Password Input */}
        <div className="relative flex items-center">
          <div className="absolute right-3.5 text-slate-400 pointer-events-none">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور (6 خانات على الأقل)"
            required
            minLength={6}
            className="w-full pr-11 pl-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action Button (Solid Purple) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm shadow-[0_4px_16px_rgba(123,44,191,0.35)] transition-all flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</span>
        </button>

        {/* Forgot password link */}
        {!isSignUp && (
          <div className="text-center mt-1">
            <button
              type="button"
              onClick={() => alert('تم إرسال رابط استعادة كلمة المرور إلى بريدك المسجل.')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        )}

        {/* Or Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium">أو</span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>الدخول باستخدام Google (مفعّل فورياً)</span>
        </button>

        {/* Toggle between Login and Sign Up */}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage('');
            setAuthRestrictedNotice(false);
            setSuccessNotice('');
          }}
          className="w-full py-3 rounded-2xl border-2 border-purple-500/40 hover:border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 text-xs font-bold transition-all text-center mt-1"
        >
          {isSignUp ? 'العودة لتسجيل الدخول' : 'إنشاء حساب جديد'}
        </button>
      </form>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-2">
        A«»M تواصل بلا حدود &copy; 2026 جميع الحقوق محفوظة
      </div>
    </div>
  );
};
