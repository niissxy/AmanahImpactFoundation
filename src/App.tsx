/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, ShieldCheck, MapPin, Share2, ClipboardCheck, ArrowRight, 
  HelpCircle, ChevronRight, MessageSquare, PhoneCall, CheckCircle, 
  Settings, User, Sparkles, RefreshCw, AlertCircle, ChevronDown, Globe, Sun, Moon,
  Menu, X
} from 'lucide-react';
import { translations, getTranslation } from './translations';
import LanguageSelector from './components/LanguageSelector';
import ZakatCalculator from './components/ZakatCalculator';
import DonationModal from './components/DonationModal';
import AdminPanel from './components/AdminPanel';
import AdminAuth from './components/AdminAuth';
import PageViews from './components/PageViews';
import { 
  OrganizationInfo, Campaign, Donation, Donor, Volunteer, 
  CsrInquiry, Report, BlogPost, Testimonial, FAQ, AdminUser 
} from './types';
import {
  organizationMock, campaignsMock, donationsMock, donorsMock,
  volunteersMock, csrInquiriesMock, reportsMock, blogsMock,
  testimonialsMock, faqsMock
} from './mockData';

export default function App() {
  const [currentLang, setCurrentLang] = useState<string>('id');
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState<boolean>(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize and persist dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Reactive tick to trigger re-renders when background translations complete
  const [translationTick, setTranslationTick] = useState<number>(0);
  useEffect(() => {
    const handleTranslationLoaded = () => {
      setTranslationTick(prev => prev + 1);
    };
    window.addEventListener('translation-loaded', handleTranslationLoaded);
    return () => {
      window.removeEventListener('translation-loaded', handleTranslationLoaded);
    };
  }, []);

  const t = (text: string) => getTranslation(text, currentLang);
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCampaignSlug, setSelectedCampaignSlug] = useState<string>('');

  // Synchronize currentView with window.location.pathname
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentView('admin');
      } else if (currentView === 'admin') {
        setCurrentView('home');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  // Also sync view changes to the URL address bar
  useEffect(() => {
    if (currentView === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin');
      }
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState({}, '', '/');
      }
    }
  }, [currentView]);

  // Persistent Authenticated Admin State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('amanah_current_admin');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentAdmin(user);
    localStorage.setItem('amanah_current_admin', JSON.stringify(user));
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('amanah_current_admin');
    triggerToast('Anda berhasil keluar dari Portal Pengurus.');
  };

  const handleUpdateAdminProfile = (user: AdminUser) => {
    setCurrentAdmin(user);
    localStorage.setItem('amanah_current_admin', JSON.stringify(user));
    triggerToast('Profil Pengurus Berhasil Diperbarui!');
  };

  // Loaded database state datasets from full-stack API
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [csrInquiries, setCsrInquiries] = useState<CsrInquiry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | null>(null);

  // Interface state configurations
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  
  // Donation dialog state
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [preSelectedSlug, setPreSelectedSlug] = useState<string>('');
  const [preSelectedAmt, setPreSelectedAmt] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // 1. Core Data fetching from our Express server with robust client fallback
  const fetchAllData = async () => {
    setIsLoading(true);
    setErrorText('');
    try {
      // Helper to fetch with localStorage and mockData fallback
      const fetchWithFallback = async (endpoint: string, localKey: string, fallbackMock: any) => {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem(localKey, JSON.stringify(data));
            return data;
          }
        } catch (e) {
          console.warn(`Fetch to ${endpoint} failed, falling back to local storage or mock.`, e);
        }
        const stored = localStorage.getItem(localKey);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            // ignore JSON parse error
          }
        }
        localStorage.setItem(localKey, JSON.stringify(fallbackMock));
        return fallbackMock;
      };

      const [org, camp, don, dnr, vol, csr, rep, bgs, tst, fqs] = await Promise.all([
        fetchWithFallback('/api/organization', 'amanah_org', organizationMock),
        fetchWithFallback('/api/campaigns', 'amanah_campaigns', campaignsMock),
        fetchWithFallback('/api/donations', 'amanah_donations', donationsMock),
        fetchWithFallback('/api/donors', 'amanah_donors', donorsMock),
        fetchWithFallback('/api/volunteers', 'amanah_volunteers', volunteersMock),
        fetchWithFallback('/api/csr-inquiries', 'amanah_csr', csrInquiriesMock),
        fetchWithFallback('/api/reports', 'amanah_reports', reportsMock),
        fetchWithFallback('/api/blogs', 'amanah_blogs', blogsMock),
        fetchWithFallback('/api/testimonials', 'amanah_testimonials', testimonialsMock),
        fetchWithFallback('/api/faqs', 'amanah_faqs', faqsMock)
      ]);

      setOrgInfo(org);
      setCampaigns(camp);
      setDonations(don);
      setDonors(dnr);
      setVolunteers(vol);
      setCsrInquiries(csr);
      setReports(rep);
      setBlogs(bgs);
      setTestimonials(tst);
      setFaqs(fqs);

    } catch (err: any) {
      console.error('All-dataset fetching failure, initializing defaults directly:', err);
      setOrgInfo(organizationMock);
      setCampaigns(campaignsMock);
      setDonations(donationsMock);
      setDonors(donorsMock);
      setVolunteers(volunteersMock);
      setCsrInquiries(csrInquiriesMock);
      setReports(reportsMock);
      setBlogs(blogsMock);
      setTestimonials(testimonialsMock);
      setFaqs(faqsMock);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  // Helper trigger to open donate preselected
  const handleOpenDonate = (slug: string = '', amount: number = 0) => {
    setPreSelectedSlug(slug);
    setPreSelectedAmt(amount);
    setIsDonateOpen(true);
  };

  // Helper hook to pay Zakat from calculator
  const handlePayZakatTrigger = (amount: number, category: string) => {
    triggerToast(`${t('Zakat Terhitung Berhasil Dikonversi')}: ${amount}`);
    handleOpenDonate('umum', amount);
  };

  // Switch to specific selected campaign storytelling view
  const handleSelectCampaign = (slug: string) => {
    setSelectedCampaignSlug(slug);
    setCurrentView('campaign-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTranslationPack = () => {
    return translations[currentLang] || translations['id'];
  };

  const langPack = getTranslationPack();

  // Find detailed selected campaign
  const activeCampaign = campaigns.find(c => c.slug === selectedCampaignSlug) || campaigns[0];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-gray-100 flex flex-col justify-between ${currentLang === 'ar' ? 'rtl' : 'ltr'}`} dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 2. DYNAMIC REAL-TIME TOAST NOTIFICATIONS */}
      {toastMessage && (
        <div id="global-toast-notif" className="fixed bottom-6 left-6 z-50 bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl border border-emerald-500 shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-300 animate-spin" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* 3. STICKY NAVBAR MAIN HEADER */}
      <header id="sticky-header" className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-2.5 px-4 md:px-8 transition-colors">
        <div id="nav-container" className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand info */}
          <button
            onClick={() => {
              setCurrentView('home');
              setSelectedCampaignSlug('');
            }}
            className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
          >
            <img
              src="/amanah_logo_1783746978284.jpg"
              alt="Amanah Impact Foundation"
              className="h-10 md:h-12 w-auto object-contain rounded-lg shadow-sm bg-white p-0.5 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Navigation Items list */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'home', key: 'navHome', sectionId: 'hero-section' },
              { id: 'masalah-solusi', key: 'navProblemSolution', sectionId: 'section-masalah' },
              { id: 'video-demo', key: 'navDemo', sectionId: 'section-video-demo' },
              { id: 'campaigns', key: 'navCampaigns', sectionId: 'section-campaigns' },
              { id: 'about', key: 'navAbout', sectionId: 'section-about' },
              { id: 'blog', key: 'navBlog', sectionId: 'section-blog' }
            ].map(item => (
              <button
                key={item.id}
                id={`navbar-item-${item.id}`}
                onClick={() => {
                  setSelectedCampaignSlug('');
                  if (currentView !== 'home') {
                    setCurrentView('home');
                    setTimeout(() => {
                      const element = document.getElementById(item.sectionId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 120);
                  } else {
                    const element = document.getElementById(item.sectionId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight transition-colors cursor-pointer shrink-0 ${
                  currentView === 'home'
                    ? 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/10'
                    : currentView === item.id 
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/10'
                }`}
              >
                {langPack[item.key] || item.id}
              </button>
            ))}

            {/* Dropdown Lainnya */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsMoreDropdownOpen(!isMoreDropdownOpen);
                  setIsLangDropdownOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight transition-colors cursor-pointer shrink-0 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/10 flex items-center gap-1"
              >
                <span>{langPack.navMore || 'Lainnya'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              
              {isMoreDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMoreDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    {[
                      { id: 'zakat', key: 'navZakat', sectionId: 'section-zakat' },
                      { id: 'transparency', key: 'navTransparency', sectionId: 'section-transparency' },
                      { id: 'csr', key: 'navCSR', sectionId: 'section-csr' },
                      { id: 'volunteer', key: 'navVolunteer', sectionId: 'section-volunteer' }
                    ].map(subItem => (
                      <button
                        key={subItem.id}
                        id={`navbar-item-${subItem.id}`}
                        onClick={() => {
                          setIsMoreDropdownOpen(false);
                          setSelectedCampaignSlug('');
                          if (currentView !== 'home') {
                            setCurrentView('home');
                            setTimeout(() => {
                              const element = document.getElementById(subItem.sectionId);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 120);
                          } else {
                            const element = document.getElementById(subItem.sectionId);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/45 hover:text-emerald-650 dark:hover:text-emerald-405 transition-colors cursor-pointer"
                      >
                        {langPack[subItem.key] || subItem.id}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {/* Language Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsMoreDropdownOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-200 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                <span className="uppercase">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              </button>

              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    {[
                      { code: 'id', label: 'Indonesian' },
                      { code: 'en', label: 'English' },
                      { code: 'ar', label: 'Arabic' },
                      { code: 'zh', label: 'Chinese' },
                      { code: 'ja', label: 'Japanese' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          currentLang === lang.code
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        <span>{lang.label}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              title={t('Ubah Mode Layar (Gelap/Terang)')}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMoreDropdownOpen(false);
                setIsLangDropdownOpen(false);
              }}
              className="lg:hidden p-1.5 md:p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer animate-in zoom-in-90 duration-150"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-red-500" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown Menu Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'home', key: 'navHome', sectionId: 'hero-section' },
                { id: 'masalah-solusi', key: 'navProblemSolution', sectionId: 'section-masalah' },
                { id: 'video-demo', key: 'navDemo', sectionId: 'section-video-demo' },
                { id: 'campaigns', key: 'navCampaigns', sectionId: 'section-campaigns' },
                { id: 'about', key: 'navAbout', sectionId: 'section-about' },
                { id: 'blog', key: 'navBlog', sectionId: 'section-blog' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setSelectedCampaignSlug('');
                    if (currentView !== 'home') {
                      setCurrentView('home');
                      setTimeout(() => {
                        const element = document.getElementById(item.sectionId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 120);
                    } else {
                      const element = document.getElementById(item.sectionId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                    currentView === 'home'
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50/10 hover:text-emerald-650'
                      : currentView === item.id
                      ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50/10 hover:text-emerald-650'
                  }`}
                >
                  {langPack[item.key] || item.id}
                </button>
              ))}

              {/* Collapsible/Grouped items of 'Lainnya' on mobile */}
              <div className="border-t border-gray-100 dark:border-gray-800 my-1 pt-1">
                <span className="px-3 py-1 text-[10px] uppercase font-black tracking-wider text-gray-400 block">
                  {langPack.navMore || 'Lainnya'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {[
                    { id: 'zakat', key: 'navZakat', sectionId: 'section-zakat' },
                    { id: 'transparency', key: 'navTransparency', sectionId: 'section-transparency' },
                    { id: 'csr', key: 'navCSR', sectionId: 'section-csr' },
                    { id: 'volunteer', key: 'navVolunteer', sectionId: 'section-volunteer' }
                  ].map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setSelectedCampaignSlug('');
                        if (currentView !== 'home') {
                          setCurrentView('home');
                          setTimeout(() => {
                            const element = document.getElementById(subItem.sectionId);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 120);
                        } else {
                          const element = document.getElementById(subItem.sectionId);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      className="text-left px-3 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-650 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {langPack[subItem.key] || subItem.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 4. MAIN LOADING AND ERROR GRACEFUL PLACEMENTS */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 grow w-full">
        {isLoading ? (
          <div id="loading-page-skeleton" className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white">{t('Menghubungkan Digital Ledger Amanah...')}</h3>
              <p className="text-xs text-gray-400 mt-2">{t('Sedang sinkronisasi basis data, laporan dampak, & opini WTP real-time.')}</p>
            </div>
            
            {/* Skeletal placeholders cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8">
              {[1, 2, 3].map(skIdx => (
                <div key={skIdx} className="bg-white dark:bg-slate-800 border border-gray-200 p-6 rounded-2xl h-44 animate-pulse space-y-4">
                  <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-1/2 h-2.5 bg-gray-100 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : errorText ? (
          <div id="error-alert-card" className="max-w-xl mx-auto bg-red-50 text-red-800 border border-red-200 p-6 rounded-2xl text-center shadow-lg space-y-4 my-10">
            <AlertCircle className="w-12 h-12 text-red-650 mx-auto animate-bounce" />
            <div>
              <h3 className="font-bold">{t('Koneksi Database Terputus')}</h3>
              <p className="text-xs text-red-600 leading-normal mt-2">{errorText}</p>
            </div>
            <button
              onClick={fetchAllData}
              className="bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-xs"
            >
              {t('Coba Hubungkan Kembali')}
            </button>
          </div>
        ) : (
          <>
            {/* VIEW MANAGER - ROUTING BRANCH ROUTER */}

            {/* Main Page and subpages rendering */}
            {['home', 'about', 'campaigns', 'transparency', 'csr', 'volunteer', 'blog'].includes(currentView) && (
              <PageViews
                currentView={currentView}
                campaigns={campaigns}
                donations={donations}
                donors={donors}
                blogs={blogs}
                testimonials={testimonials}
                faqs={faqs}
                currentLang={currentLang}
                langPack={langPack}
                onSelectCampaign={handleSelectCampaign}
                onOpenDonateModal={handleOpenDonate}
                onRefreshAll={fetchAllData}
              />
            )}

            {/* Special standalone calculations page Zakat */}
            {currentView === 'zakat' && (
              <ZakatCalculator 
                onPayZakat={handlePayZakatTrigger} 
                langPack={langPack} 
                currentLang={currentLang}
              />
            )}

            {/* Special Standalone Backoffice and CRM Admin Panel with Authentication */}
            {currentView === 'admin' && (
              currentAdmin ? (
                <AdminPanel
                  currentAdmin={currentAdmin}
                  setCurrentAdmin={handleUpdateAdminProfile}
                  onLogout={handleAdminLogout}
                  campaigns={campaigns}
                  donations={donations}
                  donors={donors}
                  volunteers={volunteers}
                  csrInquiries={csrInquiries}
                  reports={reports}
                  blogs={blogs}
                  onRefreshAll={fetchAllData}
                  langPack={langPack}
                  currentLang={currentLang}
                />
              ) : (
                <AdminAuth
                  onLoginSuccess={handleAdminLoginSuccess}
                  langPack={langPack}
                  currentLang={currentLang}
                />
              )
            )}

            {/* Special SToryteling detail page */}
            {currentView === 'campaign-detail' && activeCampaign && (
              <div id="campaign-detail-page" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-8 space-y-6">
                  {/* Title and Hero banner of specific detail */}
                  <div className="space-y-3">
                    <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded uppercase tracking-wider inline-block">
                      {t(activeCampaign.category)}
                    </span>
                    <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                      {t(activeCampaign.title)}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {t('Kawasan')}: {t(activeCampaign.location)}
                    </p>
                  </div>

                  <div className="w-full h-80 rounded-3xl bg-slate-900 pointer-events-none select-none overflow-hidden relative border border-gray-200">
                    <img 
                      src={activeCampaign.thumbnailUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'} 
                      alt={activeCampaign.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>

                  {/* Story text */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-700 space-y-4 text-slate-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                    <h4 className="font-sans font-bold text-gray-900 dark:text-white text-base">{t('Rincian Latar Belakang & Alokasi Penyaluran')}</h4>
                    {t(activeCampaign.story || activeCampaign.shortDescription)}
                  </div>

                  {/* Dynamic Milestone of aid update */}
                  <div id="campaign-milestone" className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-3">
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider block">{t('Timeline Berita Acara & Update Lapangan')}</h4>
                    
                    <div className="relative border-l border-emerald-500 pl-4 ml-2.5 py-2.5">
                      <div className="relative">
                        <span className="absolute -left-[21px] top-0 bg-emerald-500 border border-emerald-100 rounded-full w-2.5 h-2.5"></span>
                        <div className="text-xs space-y-1">
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block font-mono">{t('20 Mei 2026 - Pengadaan Logistik Tahap 1')}</span>
                          <p className="text-gray-500 leading-normal">{t('Pembelian material sumur bor sedia tuntas dikerjakan oleh relawan kemitraan, siap disalurkan ke lokasi sasaran dhuafa murni.')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Side Action Box */}
                <div className="lg:col-span-4 bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow space-y-5">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">{t('Progress Terkumpul')}</span>
                    <strong className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight block mt-1">
                      {formatCurrency(activeCampaign.collectedAmount)}
                    </strong>
                    <span className="text-[11px] text-gray-400 block mt-1 leading-none">
                      {t('Dari Target')}: {formatCurrency(activeCampaign.targetAmount)}
                    </span>
                  </div>

                  {/* Meter bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (activeCampaign.collectedAmount / activeCampaign.targetAmount) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium text-right">
                      {Math.min(100, Math.round((activeCampaign.collectedAmount / activeCampaign.targetAmount) * 100))}% {t('Tercapai')}
                    </div>
                  </div>

                  <div className="text-xs grid grid-cols-2 gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 text-center font-medium">
                    <div className="bg-gray-100/50 dark:bg-gray-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">{t('Penerima Manfaat')}</span>
                      <strong className="text-gray-800 dark:text-white mt-1 block">{activeCampaign.beneficiaryReached || 120} {t('Orang')}</strong>
                    </div>
                    <div className="bg-gray-100/50 dark:bg-gray-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">{t('Hari Tersisa')}</span>
                      <strong className="text-gray-800 dark:text-white mt-1 block">45 {t('Hari lagi')}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenDonate(activeCampaign.slug)}
                    id="btn-donate-detail-side"
                    className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    {t('Bantu Program Ini Sekarang')}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('campaigns');
                      setSelectedCampaignSlug('');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors"
                  >
                    {t('Kembali ke Program Maslahat')}
                  </button>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* 5. FLOATING WHATSAPP INTERACTIVE CONSULTATION ICON */}
      <a
        href="https://wa.me/628123456789?text=Assalamualaikum%20Amanah%20Impact%20Foundation%20Amil,%20saya%20ingin%20berkonsultasi%20mengenai%20zakat/wakaf%20syariah..."
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 p-3.5 rounded-full text-white shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        title={t('Konsultasi Syariah Amanah via WhatsApp')}
      >
        <MessageSquare className="w-5 h-5 fill-white" />
        <span className="text-xs font-black hidden sm:inline-block pr-1">{t('Tanya Syariah')}</span>
      </a>

      {/* 6. SYSTEM FOOTER */}
      <footer id="system-footer" className="bg-slate-900 text-gray-400 text-xs py-12 px-4 md:px-8 mt-16 border-t border-slate-800 transition-colors">
        <div id="footer-container" className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <strong className="text-white font-serif tracking-tight text-base">Amanah Impact Foundation</strong>
            </div>
            <p className="leading-relaxed">
              {t("Lembaga amil zakat, wakaf, dan kemanusiaan modern bersertifikasi resmi. Transparan berdampak, amanah menggerakkan kedaulatan umat.")}
            </p>
          </div>

          <div className="space-y-2">
            <strong className="text-white block uppercase tracking-wider text-[10px]">{t("Informasi Kantor")}</strong>
            <p>{t("Gedung Menara Amanah Lantai 4, Jl. Kemakmuran No. 12 Jakarta Pusat, Indonesia")}</p>
            <p className="font-mono">Email: info@amanahimpact.org</p>
            <p className="font-mono">{t("Telp:")} (021) 8888-1234</p>
          </div>

          <div className="space-y-2 text-xs">
            <strong className="text-white block uppercase tracking-wider text-[10px]">{t("Pilar Utama Program")}</strong>
            <ul className="space-y-1 inline-block">
              <li><button onClick={() => { setCurrentView('zakat'); }} className="hover:text-white p-0">{t("Zakat Maal & Profesi")}</button></li>
              <li><button onClick={() => { setCurrentView('campaigns'); }} className="hover:text-white p-0">{t("Wakaf Produktif Abadi")}</button></li>
              <li><button onClick={() => { setCurrentView('campaigns'); }} className="hover:text-white p-0">{t("Beasiswa Dhuafa & Yatim")}</button></li>
              <li><button onClick={() => { setCurrentView('campaigns'); }} className="hover:text-white p-0">{t("Krisis Sanitasi Air Bersih")}</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <strong className="text-white block uppercase tracking-wider text-[10px]">{t("Daftar Pemberitahuan")}</strong>
            <p>{t("Dapatkan update mingguan berita acara berita lapangan terakreditasi.")}</p>
            <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <input
                type="email"
                placeholder={t("Email Anda")}
                className="bg-transparent text-[11px] p-2 outline-none grow text-white placeholder-slate-700"
              />
              <button
                onClick={() => alert(t('Terima kasih! Alamat email Anda telah terdaftar dalam newsletter Amanah.'))}
                className="bg-emerald-600 hover:bg-emerald-700 font-extrabold text-[10px] px-3.5 py-1 text-white rounded-lg transition-colors cursor-pointer"
              >
                {t("Ikut")}
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-4">
          <span>
            © 2026 <strong>Yayasan Amanah Impact Foundation</strong>. {langPack.allRightsReserved} | {t("Dibuat oleh")} <a href="https://contech.id" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-extrabold transition-colors">Contech ID</a>
          </span>
          <div className="flex gap-4">
            <button onClick={() => alert(t('No SK Kemenkumham RI: No. AHU-00123.AH.01.04 TAHUN 2024 secara transparan tersertifikasi.'))} className="hover:text-white">{t("Legalitas")}</button>
            <button onClick={() => alert(t('Setiap data transaksi dilindungi SSL 256-bit enkripsi.'))} className="hover:text-white">{t("Keamanan")}</button>
            <button onClick={() => alert(t('Ketentuan Yayasan: Aturan Syariah & Standar Transparansi No. 12 Kemensos.'))} className="hover:text-white">{t("Ketentuan Layanan")}</button>
          </div>
        </div>
      </footer>

      {/* 7. DIALOG PORTALS - DONATION MODAL ENGINE */}
      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        campaigns={campaigns}
        preSelectedCampaignSlug={preSelectedSlug}
        preSelectedAmount={preSelectedAmt}
        preSelectedCategory=""
        onSuccess={(nat) => {
          triggerToast(`${t('Alhamdulillah! Donasi')} ${formatCurrency(nat.amount)} ${t('Diterima Kerja Semangat.')}`);
          fetchAllData(); // Live database refresh
        }}
        langPack={langPack}
        currentLang={currentLang}
      />

    </div>
  );
}
