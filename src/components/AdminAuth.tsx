import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Phone, CheckCircle, AlertCircle, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

interface AdminUser {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
}

interface AdminAuthProps {
  onLoginSuccess: (user: AdminUser) => void;
  langPack: any;
  currentLang?: string;
}

export default function AdminAuth({ onLoginSuccess, langPack, currentLang = 'id' }: AdminAuthProps) {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Default avatars list to let them choose or auto-generate a beautiful avatar
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  ];

  const handleShowAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 5000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      handleShowAlert('error', 'Silakan isi semua bidang login.');
      return;
    }

    // Get users database from localStorage
    const storedUsersJson = localStorage.getItem('amanah_admin_users');
    let users = [];
    if (storedUsersJson) {
      try {
        users = JSON.parse(storedUsersJson);
      } catch (err) {
        users = [];
      }
    }

    // Include hardcoded demo admin if database is empty or doesn't have it
    const hasDemoUser = users.some((u: any) => u.email.toLowerCase() === 'admin@amanah.org');
    if (!hasDemoUser) {
      const demoUser = {
        name: 'Ahmad Syarif',
        email: 'admin@amanah.org',
        phone: '081234567890',
        password: 'admin123',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
      };
      users.push(demoUser);
      localStorage.setItem('amanah_admin_users', JSON.stringify(users));
    }

    // Authenticate user
    const matchedUser = users.find(
      (u: any) => u.email.toLowerCase() === loginEmail.toLowerCase().trim() && u.password === loginPassword
    );

    if (matchedUser) {
      handleShowAlert('success', 'Masuk berhasil! Mengalihkan ke Operational Cockpit...');
      setTimeout(() => {
        onLoginSuccess({
          name: matchedUser.name,
          email: matchedUser.email,
          phone: matchedUser.phone,
          photoUrl: matchedUser.photoUrl || defaultAvatars[0]
        });
      }, 1000);
    } else {
      handleShowAlert('error', 'Email atau password salah. Coba: admin@amanah.org / admin123');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword) {
      handleShowAlert('error', 'Silakan lengkapi semua bidang registrasi.');
      return;
    }

    if (regPassword.length < 6) {
      handleShowAlert('error', 'Sandi harus memiliki minimal 6 karakter.');
      return;
    }

    // Get database
    const storedUsersJson = localStorage.getItem('amanah_admin_users');
    let users = [];
    if (storedUsersJson) {
      try {
        users = JSON.parse(storedUsersJson);
      } catch (err) {
        users = [];
      }
    }

    // Check email uniqueness
    const emailExists = users.some((u: any) => u.email.toLowerCase() === regEmail.toLowerCase().trim());
    if (emailExists) {
      handleShowAlert('error', 'Email ini telah terdaftar sebelumnya.');
      return;
    }

    // Generate random avatar
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newUser = {
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      phone: regPhone.trim(),
      password: regPassword,
      photoUrl: randomAvatar
    };

    users.push(newUser);
    localStorage.setItem('amanah_admin_users', JSON.stringify(users));

    handleShowAlert('success', 'Registrasi admin berhasil! Silakan masuk.');
    
    // Clear inputs and switch to login
    setLoginEmail(newUser.email);
    setLoginPassword(newUser.password);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setActiveForm('login');
  };

  const handleQuickFillDemo = () => {
    setLoginEmail('admin@amanah.org');
    setLoginPassword('admin123');
    handleShowAlert('success', 'Data demo terisi otomatis! Silakan klik Masuk.');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* Visual branding header panel */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white relative text-center">
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" /> Secure Access
        </div>
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-extrabold tracking-tight">Portal Pengurus AIF</h3>
        <p className="text-xs text-emerald-100 mt-1">Akses Sistem Manajemen Digital Ledger & CRM Amanah</p>
      </div>

      {/* Forms Toggler tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => {
            setActiveForm('login');
            setAlertMsg(null);
          }}
          className={`flex-1 py-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${
            activeForm === 'login'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/10 dark:bg-emerald-950/20'
              : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <LogIn className="w-4 h-4" />
          Masuk Cockpit
        </button>
        <button
          onClick={() => {
            setActiveForm('register');
            setAlertMsg(null);
          }}
          className={`flex-1 py-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${
            activeForm === 'register'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/10 dark:bg-emerald-950/20'
              : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Daftar Admin Baru
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-5">
        
        {/* Dynamic Alert Messages */}
        {alertMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-150 ${
              alertMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-150 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300'
                : 'bg-red-50 border border-red-150 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300'
            }`}
          >
            {alertMsg.type === 'success' ? (
              <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span className="leading-relaxed">{alertMsg.text}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {activeForm === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Alamat Email Resmi
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="block w-full pl-9.5 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  placeholder="admin@amanah.org"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Kunci Sandi
                </label>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="block w-full pl-9.5 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-5"
            >
              <LogIn className="w-4 h-4" />
              Masuk Operational Cockpit
            </button>

            {/* Quick Demo Fill Indicator */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-2">
                Hak Akses Uji Coba (Demo Mode)
              </span>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 dark:text-amber-300 rounded-lg text-[10px] font-extrabold border border-amber-200/55 transition-all cursor-pointer"
              >
                Isi Otomatis Akun Demo Admin
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {activeForm === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="block w-full pl-9.5 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  placeholder="Contoh: Dr. Syarif Al-Farabi"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Alamat Email Akun
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="block w-full pl-9.5 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  placeholder="syarif@amanahimpact.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Nomor Handphone (WhatsApp)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="block w-full pl-9.5 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  placeholder="0812XXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Buat Kata Sandi
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="block w-full pl-9.5 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1.5 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <UserPlus className="w-4 h-4" />
              Daftar Akun Amil Pengurus
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
