/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, MapPin, Share2, ClipboardCheck, ArrowRight, ShieldCheck, 
  Search, Users, Calendar, Award, Building2, Smile, ArrowUpRight, CheckCircle,
  AlertCircle, Play, Smartphone, Monitor, Info, Sparkles, Star, Quote
} from 'lucide-react';
import { Campaign, Donation, Donor, Volunteer, CsrInquiry, BlogPost, FAQ, Testimonial } from '../types';
import ZakatCalculator from './ZakatCalculator';
import { getTranslation } from '../translations';

interface PageViewsProps {
  currentView: string;
  campaigns: Campaign[];
  donations: Donation[];
  donors: Donor[];
  blogs: BlogPost[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  currentLang: string;
  langPack: any;
  onSelectCampaign: (slug: string) => void;
  onOpenDonateModal: (campaignSlug?: string, amount?: number) => void;
  onRefreshAll: () => void;
}

export default function PageViews({
  currentView,
  campaigns,
  donations,
  donors,
  blogs,
  testimonials,
  faqs,
  currentLang,
  langPack,
  onSelectCampaign,
  onOpenDonateModal,
  onRefreshAll
}: PageViewsProps) {
  
  const t = (text: string) => getTranslation(text, currentLang);

  // States
  const [campSearch, setCampSearch] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('Semua');

  // CSR state form
  const [csrCompany, setCsrCompany] = useState('');
  const [csrPic, setCsrPic] = useState('');
  const [csrPhone, setCsrPhone] = useState('');
  const [csrEmail, setCsrEmail] = useState('');
  const [csrProgram, setCsrProgram] = useState('Pendidikan');
  const [csrBudget, setCsrBudget] = useState('Rp50juta - Rp100juta');
  const [csrInquirySuccess, setCsrInquirySuccess] = useState(false);

  // Volunteer state form
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volExperience, setVolExperience] = useState('');
  const [volSkills, setVolSkills] = useState<string[]>([]);
  const [volInquirySuccess, setVolInquirySuccess] = useState(false);

  // Map interactive state
  const [hoveredRegion, setHoveredRegion] = useState<{ name: string; amount: string; desc: string } | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // SVG Map regions
  const indonesiaRegions = [
    { name: 'Sumatra', amount: 'Rp 1.450.000.000', desc: '46 Sekolah Tersertifikasi & Bantuan Tanggap Bencana Gempa', cx: '15%', cy: '40%' },
    { name: 'Jawa', amount: 'Rp 4.210.000.000', desc: '14 Pesantren Mandiri, 400 Santri Asrama & 2 Sumur Bor Utama Cilacap', cx: '35%', cy: '72%' },
    { name: 'Kalimantan', amount: 'Rp 890.000.000', desc: '3 Desa Sehat Sejahtera & Perlindungan Hutan Hijau Berkelanjutan', cx: '45%', cy: '45%' },
    { name: 'Sulawesi', amount: 'Rp 1.120.000.000', desc: 'Bantuan Pangan Nelayan Pesisir & Air Mengalir Donggala', cx: '65%', cy: '50%' },
    { name: 'Nusa Tenggara & Bali', amount: 'Rp 2.800.000.000', desc: 'Sumur Bor Produktif NTT, 2 Klinik Ibu & Anak Dhuafa', cx: '62%', cy: '80%' },
    { name: 'Maluku & Papua', amount: 'Rp 1.620.000.000', desc: 'Program Edukasi Terang Papua & Distribusi Beras Gizi Pelosok Asmat', cx: '88%', cy: '60%' }
  ];

  // Submission handles
  const handleCsrForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrCompany || !csrPic || !csrPhone) {
      alert('Tolong isi data Perusahaan dan kontak PIC lengkap.');
      return;
    }
    try {
      const res = await fetch('/api/csr-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: csrCompany,
          picName: csrPic,
          whatsapp: csrPhone,
          email: csrEmail,
          interestedProgram: csrProgram,
          budgetRange: csrBudget
        })
      });
      if (res.ok) {
        setCsrInquirySuccess(true);
        setCsrCompany('');
        setCsrPic('');
        onRefreshAll();
      }
    } catch (e) {
      alert('Kesalahan jaringan.');
    }
  };

  const handleVolunteerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volEmail || !volPhone) {
      alert('Mohon isi nama lengkap dan telepon.');
      return;
    }
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: volName,
          email: volEmail,
          whatsapp: volPhone,
          experience: volExperience,
          skills: volSkills.length > 0 ? volSkills : ['Logistik Terpadu']
        })
      });
      if (res.ok) {
        setVolInquirySuccess(true);
        setVolName('');
        setVolExperience('');
        onRefreshAll();
      }
    } catch (e) {
      alert('Gagal mendata.');
    }
  };

  const handleSkillToggle = (s: string) => {
    if (volSkills.includes(s)) {
      setVolSkills(volSkills.filter(sk => sk !== s));
    } else {
      setVolSkills([...volSkills, s]);
    }
  };

  const calculateRemaining = (target: number, collected: number) => {
    return Math.max(0, target - collected);
  };

  return (
    <div id="page-views-wrapper" className="space-y-12">
      
      {/* 1. HOMEPAGE VIEW */}
      {currentView === 'home' && (
        <>
          {/* Main Hero block */}
          <section id="hero-section" className="relative py-20 px-6 rounded-3xl overflow-hidden bg-radial from-emerald-800 to-slate-900 text-white flex flex-col items-center text-center">
            
            {/* Background absolute decor */}
            <div className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200')" }}></div>
            
            <div className="max-w-3xl relative z-10 space-y-6">
              <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-55 font-extrabold px-3 py-1.5 rounded-full text-xs tracking-wider uppercase">
                {langPack.legalStatus || 'Yayasan Resmi Berizin Kemensos RI'}
              </span>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight md:leading-none text-slate-50">
                {langPack.heroHeadline}
              </h1>

              <p className="text-sm md:text-base text-gray-350 leading-relaxed max-w-2xl mx-auto font-medium">
                {langPack.heroSubheadline}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4 shrink-0">
                <button
                  id="hero-btn-donate"
                  onClick={() => onOpenDonateModal()}
                  className="bg-emerald-500 hover:bg-emerald-600 font-extrabold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" /> {langPack.btnDonateNow}
                </button>
                <button
                  id="hero-btn-transparency"
                  onClick={() => {
                    const el = document.getElementById('navbar-item-transparency');
                    if (el) el.click();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-gray-700 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
                >
                  {langPack.btnSeeImpact}
                </button>
              </div>
            </div>

            {/* Micro horizontal trust banner */}
            <div className="mt-16 w-full max-w-4xl border-t border-emerald-500/10 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-300">
              <div className="flex items-center justify-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-left">{langPack.auditBadge || 'Opini Auditor WTP Resmi'}</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 border-y sm:border-y-0 sm:border-x border-emerald-500/10 py-3 sm:py-0">
                <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-left">{t('Sertifikasi BNSP & MUI Syariat')}</span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <Smile className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-left">{t('100% Amanah Tersalurkan Nyata')}</span>
              </div>
            </div>
          </section>

          {/* SECTION MASALAH & SOLUSI */}
          <section id="section-masalah" className="scroll-mt-24 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-10 shadow-sm">
            {/* Header Utama Section */}
            <div className="text-center max-w-3xl mx-auto space-y-2.5">
              <span className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                {t('TRANSFORMASI GERAKAN SOSIAL & FILANTROPI')}
              </span>
              <h2 className="text-xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white mt-1">
                {t('Mengurai Krisis Kepercayaan dengan Solusi Nyata')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {t('Banyak niat baik terhambat karena kekhawatiran klasik dalam penyaluran dana publik. Kami hadir mengurai tantangan tersebut melalui pendekatan filantropi modern yang akuntabel, transparan, dan terukur.')}
              </p>
            </div>

            {/* Grid Perbandingan Dampak Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* KOLOM KIRI: MASALAH (Style Merah / Rose) */}
              <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/60 dark:border-rose-900/20 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="border-b border-rose-100 dark:border-rose-900/40 pb-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{t('TANTANGAN UTAMA')}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mt-1">
                    {t('Krisis Kepercayaan Publik')}
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex gap-4 items-start bg-white dark:bg-gray-900 p-4 rounded-xl border border-rose-100/30 dark:border-rose-900/20 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/55 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-mono text-xs font-black">
                      01
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">
                        {t('Ketidakjelasan Laporan Keuangan')}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('Donatur sering tidak mengetahui ke mana sisa dana disalurkan. Laporan keuangan tahunan yang lambat diunggah memicu keraguan publik atas akuntabilitas lembaga.')}
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-4 items-start bg-white dark:bg-gray-900 p-4 rounded-xl border border-rose-100/30 dark:border-rose-900/20 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/55 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-mono text-xs font-black">
                      02
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">
                        {t('Biaya Operasional Amil Tersembunyi')}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('Potongan administrasi yang terlalu tinggi dan tidak transparan di awal seringkali memotong esensi nilai donasi yang diterima penerima manfaat murni di lapangan.')}
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex gap-4 items-start bg-white dark:bg-gray-900 p-4 rounded-xl border border-rose-100/30 dark:border-rose-900/20 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/55 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-mono text-xs font-black">
                      03
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">
                        {t('Dampak Penyaluran yang Sulit Diukur')}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('Penyaluran dana sering kali bersifat konsumtif jangka pendek sekali habis, tanpa pengukuran dampak sosial yang jelas bagi masa depan penerima manfaat.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: SOLUSI (Style Hijau / Emerald) */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="border-b border-emerald-100 dark:border-emerald-900/40 pb-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{t('SOLUSI AMANAH IMPACT')}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mt-1">
                    {t('Transparansi Digital & Dampak Nyata')}
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex gap-4 items-start bg-white dark:bg-gray-900 p-4 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-mono text-xs font-black">
                      01
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-950 dark:text-white text-xs">
                        {t('Real-Time Public Ledger')}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('Setiap sen donasi yang masuk atau keluar langsung tercatat dan dapat dipantau oleh siapa saja secara seketika melalui mutasi publik terbuka tanpa rekayasa.')}
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-4 items-start bg-white dark:bg-gray-900 p-4 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-mono text-xs font-black">
                      02
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-905 dark:text-white text-xs">
                        {t('100% Penyaluran Murni & CSR Ops')}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('Dengan opsi biaya admin 0% untuk donatur, seluruh pembiayaan administrasi ditanggung oleh dana kontribusi dari kemitraan strategis korporasi (CSR) kami.')}
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex gap-4 items-start bg-white dark:bg-gray-900 p-4 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-mono text-xs font-black">
                      03
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-905 dark:text-white text-xs">
                        {t('Laporan Dampak & Monitoring Terukur')}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('Kami menggunakan metodologi kualifikasi sosial untuk melacak perbaikan ekonomi dan pendidikan penerima manfaat yang didokumentasikan berkala oleh tim relawan.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION VIDEO DEMO & PLATFORM MOCKUPS */}
          <section id="section-video-demo" className="scroll-mt-24 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 text-white space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="max-w-xl">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  {t('DEMO TOOLS & PLATFORM TRANSPARANSI')}
                </span>
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-white mt-1">
                  {t('Eksplorasi Aplikasi & Dashboard Amil')}
                </h2>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {t('Kami menyediakan perangkat pintar baik bagi para donatur untuk menghitung kontribusi mereka, maupun dashboard terintegrasi bagi publik dan amil untuk memantau aliran dana.')}
                </p>
              </div>

              {/* Demo Section Tab Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0 font-bold">
                <button
                  onClick={() => alert('Simulasi Sesi: Anda sedang melihat rancangan dashboard admin.')}
                  className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Live Demo Mode Active
                </button>
              </div>
            </div>

            {/* Browser & Phone Showcase Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
              
              {/* DESKTOP BROWSER CHROME MOCKUP */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="bg-emerald-500/10 px-2 py-1 rounded">Desktop View</span>
                    <span>•</span>
                    <span className="text-gray-400 font-medium">{t('Dashboard Real-Time Pengawasan Publik')}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{t('Sistem Transparansi Ledger Utama')}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {t('Sistem berbasis awan (cloud) yang merangkum kurva pengumpulan dana, sebaran wilayah, penugasan amil di lapangan, serta audit ledger otomatis yang dapat diunduh publik dalam format standar WTP.')}
                  </p>
                </div>

                {/* Actual Browser Device Frame Wrapper */}
                <div className="bg-slate-955 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Browser top-bar chrome */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
                    {/* Fake dots window */}
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    {/* Fake URL bar */}
                    <div className="bg-slate-950 text-[10px] text-gray-500 border border-slate-800 px-3 py-1 rounded-lg grow flex items-center justify-between font-mono select-none">
                      <span className="truncate">https://ais-dev.run.app/admin-ledger-dashboard</span>
                      <span className="text-emerald-400 font-bold">● SECURE</span>
                    </div>
                  </div>
                  
                  {/* Browser contents image viewport */}
                  <div className="relative group overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                    <img 
                      src="/desktop_dashboard_screenshot_1783738865394.jpg" 
                      alt="Desktop Dashboard Screenshot"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-500 pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Play / Demo Interactive Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300 cursor-pointer">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        {t('Eksplorasi Platform')}
                      </div>
                    </div>

                    {/* Interactive Hotspots over the screenshot */}
                    <div className="absolute top-[35%] left-[25%] group/hotspot cursor-help">
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                      <span className="relative block w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      <div className="absolute left-6 top-0 hidden group-hover/hotspot:block bg-slate-950 border border-slate-800 text-[10px] p-2.5 rounded-xl w-48 shadow-xl text-left z-20 space-y-1">
                        <strong className="text-emerald-400 block font-bold">{t('Ledger Keuangan Digital')}</strong>
                        <p className="text-gray-400 leading-normal font-semibold">{t('Bagan garis tren mengorelasikan donasi masuk secara instan ke program sasaran tanpa penundaan amil.')}</p>
                      </div>
                    </div>

                    <div className="absolute top-[65%] left-[75%] group/hotspot cursor-help">
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                      <span className="relative block w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      <div className="absolute right-6 top-0 hidden group-hover/hotspot:block bg-slate-950 border border-slate-800 text-[10px] p-2.5 rounded-xl w-48 shadow-xl text-left z-20 space-y-1">
                        <strong className="text-emerald-400 block font-bold">{t('Status Wajar Tanpa Pengecualian')}</strong>
                        <p className="text-gray-400 leading-normal font-semibold">{t('Setiap kuitansi lunas memiliki audit trail berkode unik terenkripsi demi menjamin transparansi tinggi.')}</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* MOBILE APP PHONE MOCKUP */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="bg-emerald-500/10 px-2 py-1 rounded">Mobile App View</span>
                    <span>•</span>
                    <span className="text-gray-400 font-medium">{t('Kalkulator Zakat & Donasi Kilat')}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{t('Aplikasi Layanan Syariah Mandiri')}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {t('Kemudahan berdonasi, melacak rekam donasi pribadi, serta menghitung zakat maal, penghasilan, dan emas secara mandiri di mana pun Anda berada.')}
                  </p>
                </div>

                {/* Actual Phone Frame Mockup */}
                <div className="bg-slate-950 border-4 border-slate-800 rounded-[35px] overflow-hidden shadow-2xl relative max-w-[280px] mx-auto w-full aspect-[9/18.5]">
                  {/* Phone notch speaker top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 h-4.5 w-28 rounded-b-xl z-20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 block"></span>
                  </div>

                  {/* Phone screen image viewport */}
                  <div className="relative h-full bg-slate-900 overflow-hidden group">
                    <img 
                      src="/mobile_app_screenshot_1783738879626.jpg" 
                      alt="Mobile App Screenshot"
                      className="w-full h-full object-cover opacity-95 group-hover:scale-[1.03] transition-transform duration-500 pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                    />

                    {/* Interactive Hotspot inside the Phone screen */}
                    <div className="absolute top-[40%] left-[50%] -translate-x-1/2 group/hotspot cursor-help">
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                      <span className="relative block w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-slate-950 border border-slate-800 text-[9px] p-2 rounded-xl w-40 shadow-xl text-center z-20 space-y-1">
                        <strong className="text-emerald-400 block font-bold">{t('Kalkulator Zakat Otomatis')}</strong>
                        <p className="text-gray-400 leading-normal font-semibold">{t('Fatwa Syariah MUI langsung tertanam di dalam hitungan cepat.')}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-[9px] text-white px-3 py-1.5 rounded-full font-bold shadow opacity-80 group-hover:opacity-100 transition-opacity">
                      {t('Geser untuk Jelajah')}
                    </div>
                  </div>

                  {/* Phone bottom bar line indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-slate-700 h-1 w-20 rounded-full z-20"></div>
                </div>
              </div>

            </div>
          </section>

          {/* Quick interactive search section */}
          <section id="section-campaigns" className="scroll-mt-24 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black block">
                  {langPack.secFeatured || 'Rekomendasi Program'}
                </span>
                <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-slate-50 tracking-tight mt-1.5 leading-none">
                  {t('Kampanye Darurat & Kemanusiaan')}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {t('Kontribusi Anda akan disalurkan hari ini dengan pelaporan berita acara audit real-time.')}
                </p>
              </div>
              <button
                id="btn-all-campaigns"
                onClick={() => {
                  const el = document.getElementById('navbar-item-campaigns');
                  if (el) el.click();
                }}
                className="text-emerald-600 hover:text-emerald-700 font-extrabold text-xs flex items-center gap-1 shrink-0"
              >
                {t('Lihat Semua Program')} ({campaigns.length})
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Campaign grid cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.slice(0, 3).map(c => {
                const percent = Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100));
                
                return (
                  <div key={c.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col justify-between hover:shadow-xl dark:shadow-none transition-shadow group">
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img 
                        src={c.thumbnailUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600'} 
                        alt={c.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[9px] px-2.5 py-1 rounded uppercase tracking-wider">
                        {t(c.category)}
                      </span>
                      {c.urgency === 'high' && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                          {langPack.urgencyUrgent || 'Urgen'}
                        </span>
                      )}
                    </div>

                    <div className="p-5 grow space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => onSelectCampaign(c.slug)}
                          className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug block hover:text-emerald-600 transition-colors text-left font-sans line-clamp-2"
                        >
                          {t(c.title)}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {t(c.shortDescription)}
                        </p>
                      </div>

                      {/* Financial progress metric */}
                      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                          <span>{langPack.collected}: <strong>{formatCurrency(c.collectedAmount)}</strong></span>
                          <span className="font-bold text-gray-800 dark:text-white">{percent}%</span>
                        </div>

                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                          <span>{t('Sisa')}: {formatCurrency(calculateRemaining(c.targetAmount, c.collectedAmount))}</span>
                          <span>{t(c.location)}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2 shrink-0">
                        <button
                          onClick={() => onSelectCampaign(c.slug)}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-2 px-3 rounded-xl hover:bg-gray-200 text-xs transition-colors"
                        >
                          {t('Detail')}
                        </button>
                        <button
                          id={`btn-donate-quick-${c.slug}`}
                          onClick={() => onOpenDonateModal(c.slug)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" /> {t('Bantu Sekarang')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* INTERACTIVE GEOGRAPHY DISTRIBUTION MAP */}
          <section id="interactive-map" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white space-y-6 relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                {t('Live Distribution Ledger')}
              </span>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1">
                {langPack.petaDistribusi || 'Peta Distribusi Kemanusiaan Se-Indonesia'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {t('Arahkan kursor atau sentuh kota sebaran emas kedaulatan di bawah ini untuk melihat total penyaluran donasi dan proyek kemaslahatan yang sedang berjalan di kawasan tersebut.')}
              </p>
            </div>

            {/* Custom high-contrast responsive SVG Map Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-radial from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800">
              
              <div className="lg:col-span-8 relative flex justify-center items-center h-64 md:h-80 w-full bg-slate-950/40 rounded-xl overflow-hidden p-2">
                
                {/* SVG Outline Vector of Indonesia Archipelago stylised */}
                <svg viewBox="0 0 1000 400" className="w-full h-full text-slate-800 stroke-slate-700 select-none opacity-90 stroke-1 fill-none">
                  {/* Sumatra stylized path */}
                  <polygon points="50,120 120,40 220,110 160,250 80,210" fill="#334155" opacity="0.3" className="hover:fill-emerald-800/20 active:fill-emerald-800/20 cursor-pointer transition-colors" />
                  
                  {/* Java stylized path */}
                  <polygon points="120,290 320,285 360,290 350,330 140,320" fill="#334155" opacity="0.3" className="hover:fill-emerald-800/20 active:fill-emerald-800/20 cursor-pointer transition-all" />
                  
                  {/* Kalimantan stylized path */}
                  <polygon points="300,100 450,80 500,120 460,225 310,210" fill="#334155" opacity="0.3" className="hover:fill-emerald-800/20 cursor-pointer transition-all" />

                  {/* Sulawesi stylized path */}
                  <polygon points="580,120 620,110 650,210 600,240 550,190" fill="#334155" opacity="0.3" className="hover:fill-emerald-805/20 cursor-pointer transition-all" />

                  {/* Bali & Nusa Tenggara stylized path */}
                  <polygon points="400,325 610,320 640,345 420,350" fill="#334155" opacity="0.3" className="hover:fill-emerald-810/20 cursor-pointer transition-all" />

                  {/* Papua stylized path */}
                  <polygon points="800,150 950,150 940,290 850,280 810,190" fill="#334155" opacity="0.3" className="hover:fill-emerald-820/20 cursor-pointer transition-all" />
                </svg>

                {/* Animated coordinate pulses points */}
                {indonesiaRegions.map((reg) => (
                  <button
                    key={reg.name}
                    id={`map-node-${reg.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                    onMouseEnter={() => setHoveredRegion({ name: t(reg.name), amount: reg.amount, desc: t(reg.desc) })}
                    onClick={() => {
                      setHoveredRegion({ name: t(reg.name), amount: reg.amount, desc: t(reg.desc) });
                      alert(`${t('Regional')}: ${t(reg.name)}\n${t('Total Disalurkan')}: ${reg.amount}\n${t('Program')}: ${t(reg.desc)}`);
                    }}
                    style={{ left: reg.cx, top: reg.cy }}
                    className="absolute p-2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    title={t(reg.name)}
                  >
                    <span className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
                    <span className="relative block w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow shadow-emerald-600/50"></span>
                  </button>
                ))}
              </div>

              {/* Highlight Region Panel */}
              <div className="lg:col-span-4 bg-slate-950/50 border border-slate-800 rounded-xl p-5 min-h-[140px] flex flex-col justify-center space-y-2">
                {hoveredRegion ? (
                  <>
                    <div className="flex items-center gap-1.5 text-emerald-450 font-black">
                      <MapPin className="w-4 h-4 text-emerald-400 fill-none" />
                      <span className="font-extrabold text-sm">{hoveredRegion.name}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">{t('Total Penyaluran Sukses')}</span>
                      <strong className="text-xl font-mono text-emerald-450">{hoveredRegion.amount}</strong>
                      <p className="text-xs text-gray-400 leading-normal font-semibold">
                        {hoveredRegion.desc}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    <p>{t('Sentuh salah satu bintik hijau')} <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full"></span> {t('pada peta kepulauan untuk menelaah rincian program.')}</p>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Testimonial & Donor Carousel */}
          <section id="testimonials-feed" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl p-6 md:p-8 space-y-4">
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">{t('Kata Penerima Manfaat')}</span>
              {testimonials.length > 0 ? (
                <div className="space-y-4">
                  <p className="font-serif italic text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                    "{t(testimonials[0].message)}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonials[0].avatarUrl} 
                      alt={testimonials[0].name} 
                      className="w-10 h-10 rounded-full shrink-0 select-none pointer-events-none" 
                    />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-xs block">{testimonials[0].name}</span>
                      <span className="text-[10px] text-gray-400 block">{t(testimonials[0].role)} • {t(testimonials[0].location)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">{t('No testimonials registered')}</span>
              )}
            </div>

            {/* List last donations on feed */}
            <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl p-6 md:p-8 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 block">{langPack.donorWall || 'Daftar Kebaikan Donatur'}</span>
                <span className="text-[10px] text-gray-400 block mt-1">{t('Solidaritas nyata kontribusi lunas masyarakat.')}</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-750 max-h-48 overflow-y-auto block pr-1.5 space-y-2 text-xs">
                {donations.filter(d => d.status === 'success').slice(0, 5).map(dnat => (
                  <div key={dnat.id} className="pt-2 flex justify-between items-center font-medium">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-white block">
                        {dnat.isAnonymous ? t('Hamba Allah') : dnat.donorName}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate max-w-[170px]" title={dnat.campaignTitle}>{dnat.campaignTitle}</span>
                    </div>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                      {formatCurrency(dnat.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION ZAKAT DIGITAL */}
          <section id="section-zakat" className="scroll-mt-24">
            <ZakatCalculator 
              onPayZakat={(amount, category) => onOpenDonateModal(undefined, amount)} 
              langPack={langPack} 
              currentLang={currentLang}
            />
          </section>

          {/* SECTION TRANSPARENCY & MUTASI LEDGER */}
          <section id="section-transparency" className="scroll-mt-24 space-y-8 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-150 dark:border-gray-750">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <span className="text-xs uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider block">{t('MUTASI KUNCI')}</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white">{t('Pertanggungjawaban Finansial Publik')}</h2>
              <p className="text-xs text-gray-400 leading-normal">
                {t('Yayasan menyajikan ledger penerimaan dana masuk (ledger transaksi) lunas publik secara seketika gunanya menjamin transparansi tinggi 100% bebas dari rekayasa keuangan.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl">
                <span className="text-xs text-slate-500 font-semibold block">{t('Total Akuntabilitas Ledger')}</span>
                <strong className="text-2xl font-mono text-emerald-700 dark:text-emerald-400 block mt-1">{t('100% TERBUKA')}</strong>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl">
                <span className="text-xs text-slate-500 font-semibold block">{t('Sertifikat Audit Keuangan')}</span>
                <strong className="text-2xl font-mono text-gray-955 dark:text-white block mt-1">{t('Rating WTP RI')}</strong>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl">
                <span className="text-xs text-slate-500 font-semibold block">{t('Metrik Penyaluran Dampak')}</span>
                <strong className="text-2xl font-mono text-teal-600 dark:text-teal-400 block mt-1">{t('Sains & Terbimbing')}</strong>
              </div>
            </div>

            {/* Ledger mapping list */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-4 md:p-6 space-y-4">
              <div>
                <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-450 block">{t('Real-Time Ledger Transaksi Publik')}</span>
                <span className="text-[10px] text-gray-500 block">{t('Jurnal mutasi ini diperbarui secara instan begitu kontribusi Anda tuntas diterima oleh sistem perbankan.')}</span>
              </div>

              <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-extrabold border-b border-gray-300 dark:border-gray-750">
                      <th className="p-3">{t('Waktu Masuk')}</th>
                      <th className="p-3">{t('Ref ID')}</th>
                      <th className="p-3">{t('Nama Donatur')}</th>
                      <th className="p-3">{t('Alokasi Penyaluran Program')}</th>
                      <th className="p-3">{t('Jumlah Dana')}</th>
                      <th className="p-3 text-right">{t('Verifikasi')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.filter(d => d.status === 'success').slice(0, 5).map(tx => (
                      <tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-emerald-50/5 text-xs text-gray-600 dark:text-gray-300">
                        <td className="p-3 font-mono text-[10px]">
                          {new Date(tx.createdDate).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 font-mono font-bold text-gray-500">{tx.id}</td>
                        <td className="p-3 font-bold">
                          {tx.isAnonymous ? t('Hamba Allah') : tx.donorName}
                        </td>
                        <td className="p-3 font-semibold truncate max-w-[150px]" title={tx.campaignTitle}>
                          {tx.campaignTitle}
                        </td>
                        <td className="p-3 font-extrabold text-gray-900 dark:text-white">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                            {t('APPROVED')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION ABOUT US */}
          <section id="section-about" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-150 dark:border-gray-750 space-y-10 text-gray-700 dark:text-gray-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-extrabold tracking-widest block">{t('SIAPAKAH KAMI')}</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {t('Menjembatani Kepedulian, Merajut Kemandirian Berkelanjutan')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed leading-normal">
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{t('Visi Yayasan')}</h4>
                <p>
                  {t('Menjadi episentrum pemberdayaan masyarakat dhuafa dan tata kelola dana sosial Islam (Zakat, Infaq, Sedekah, Wakaf) terdepan di Indonesia yang berorientasi sains, akuntabilitas digital berlapis, dan berkelanjutan ekologis.')}
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{t('Definisi Naskah Legalitas')}</h4>
                <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl font-mono text-[10px] space-y-1 select-all border border-gray-100 dark:border-gray-800">
                  <span className="block"><strong>{t('SK Kemenkumham:')}</strong> AHU-00123.AH.01.04 TAHUN 2024</span>
                  <span className="block"><strong>{t('Reg Dinsos RI:')}</strong> 312/DINSOS-PP/2025</span>
                  <span className="block"><strong>{t('NPWP Lembaga:')}</strong> 45.123.456.7-012.000</span>
                  <span className="block"><strong>{t('Opini Keuangan:')}</strong> {t('WTP (Wajar Tanpa Pengecualian) audit independen')}</span>
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <div className="text-center md:text-left shrink-0">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider block uppercase">{t('Dewan Direksi & Syariah')}</span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{t('Struktur Kepemimpinan Amanah')}</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
                {[
                  { name: 'Prof. Dr. KH. Ahmad Fauzi, M.A', role: 'Dewan Pengawas Syariah' },
                  { name: 'Ir. H. Budi Santoso, M.B.A', role: 'Direktur Eksekutif Yayasan' },
                  { name: 'Dr. Siti Aminah, S.E, M.Si', role: 'Kepala Bidang Akuntansi & Audit' },
                  { name: 'H. Muhammad Ridwan, Lc', role: 'Amil Zakat & Wakaf Syariah' }
                ].map(board => (
                  <div key={board.name} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-850">
                    <span className="font-extrabold text-gray-900 dark:text-white block tracking-tight leading-snug">{t(board.name)}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-1">{t(board.role)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION CSR SOLUTIONS */}
          <section id="section-csr" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">
            <div className="md:col-span-7 space-y-6">
              <span className="text-emerald-600 dark:text-emerald-450 text-xs font-black uppercase block tracking-wider">{t('CSR & ESG SOLUTIONS PARTNERSHIP')}</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-950 dark:text-white leading-snug tracking-tight">
                {t('Tingkatkan Dampak ESG Perusahaan Anda Bersama Kami')}
              </h2>
              <p className="leading-relaxed leading-normal font-medium text-gray-550 dark:text-gray-400">
                {t('Kami menyusun kemitraan program berkelanjutan siap saji didukung oleh infografis audit, dokumentasi foto, kuitansi digital, serta verifikasi laporan dampak yang patuh terhadap kualifikasi kriteria GRI (Global Reporting Initiative) & ESG.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm block mb-1">{t('Penyalur Terakreditasi B')}</span>
                  <p className="text-gray-500">{t('Seluruh berita acara diautentikasi resmi menteri sosial & amil.')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm block mb-1">{t('Tailored ESG Dashboard')}</span>
                  <p className="text-gray-500">{t('Dashboard digital kustom korporasi guna paparan direksi RUPS.')}</p>
                </div>
              </div>
            </div>

            <div id="home-csr-form-panel" className="md:col-span-5 bg-gray-50/50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-750 p-6 rounded-2xl space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <h4 className="font-extrabold text-gray-950 dark:text-white">{t('Formulir Kolaborasi CSR')}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{t('Ajukan konsultasi program ESG korporat, tim kami akan menjadwalkan meeting dalam 1x24 jam.')}</p>
              </div>

              {csrInquirySuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                  <span className="font-bold block">{t('Terima Kasih, Mitra CSR!')}</span>
                  <p className="text-[11px]">{t('Prospektus kolaborasi dan proposal program kerja sedia terkirim ke email, tim amil segera menghubungi WhatsApp Anda.')}</p>
                  <button 
                    onClick={() => setCsrInquirySuccess(false)}
                    className="bg-white hover:bg-gray-100 text-emerald-800 font-extrabold px-3 py-1 rounded border text-[10px]"
                  >
                    {t('Ajukan Lagi')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCsrForm} className="space-y-3 font-xs">
                  <div>
                    <label className="block font-bold mb-1">{t('1. Nama Perusahaan / Korporasi')}</label>
                    <input
                      type="text"
                      required
                      value={csrCompany}
                      onChange={(e) => setCsrCompany(e.target.value)}
                      placeholder={t('Contoh: PT Angkasa Raya Tbk')}
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t('2. Nama Lengkap PIC Perusahaan')}</label>
                    <input
                      type="text"
                      required
                      value={csrPic}
                      onChange={(e) => setCsrPic(e.target.value)}
                      placeholder={t('Contoh: Ibu Ranti Safitri')}
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">{t('Phone / WA PIC')}</label>
                      <input
                        type="text"
                        required
                        value={csrPhone}
                        onChange={(e) => setCsrPhone(e.target.value)}
                        placeholder="0812XXXXXXXX"
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">{t('Alamat Email Kerja')}</label>
                      <input
                        type="email"
                        value={csrEmail}
                        onChange={(e) => setCsrEmail(e.target.value)}
                        placeholder="pic@corporate.com"
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t('Pilar Program yang Diminati')}</label>
                    <select
                      value={csrProgram}
                      onChange={(e) => setCsrProgram(e.target.value)}
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    >
                      <option value="Pendidikan Mandiri">{t('Beasiswa Santri & Asrama Yatim')}</option>
                      <option value="Air Bersih">{t('Sumur Bor Produktif Krisis Air')}</option>
                      <option value="Kesehatan Tangguh">{t('Klinik Kesehatan Keliling Dhuafa')}</option>
                      <option value="Reboisasi">{t('Mitigasi Emisi Karbon Green Reboisasi')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t('Target Anggaran Kemitraan')}</label>
                    <select
                      value={csrBudget}
                      onChange={(e) => setCsrBudget(e.target.value)}
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    >
                      <option value="Rp50juta - Rp100juta">{t('Rp50 Juta - Rp100 Juta')}</option>
                      <option value="Rp100juta - Rp250juta">{t('Rp100 Juta - Rp250 Juta')}</option>
                      <option value="Rp250juta_plus">{t('Di atas Rp250 Juta')}</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      {t('Ajukan Kemitraan ESG')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* SECTION VOLUNTEER */}
          <section id="section-volunteer" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-150 dark:border-gray-750">
            <div className="md:col-span-7 space-y-6">
              <span className="text-emerald-600 dark:text-emerald-450 text-xs font-black uppercase block tracking-wider">{t('JOIN AMANAH FORCE')}</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white leading-snug tracking-tight">
                {t('Ayo Ambil Peran dalam Barisan Penggerak Kebaikan')}
              </h2>
              <p className="leading-relaxed leading-normal font-medium text-gray-550 dark:text-gray-400">
                {t('Yayasan membuka seluas-luasnya peluang kontribusi kebahagiaan para pemuda Indonesia untuk terjun sebagai tim relawan lapangan penanggulangan kekeringan, edukasi mengajar mengaji pelosok, pendataan logistik bantuan bencana, murni tanpa pamrih demi kemanusiaan mulia.')}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-950 dark:text-white text-sm">{t('Pelatihan Kesiapsiagaan Darurat')}</strong>
                    <p className="text-gray-500 mt-1">{t('Dapatkan pembekalan kompetensi SAR, mitigasi bencana psikososial anak dari para profesional.')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-955 dark:text-white text-sm">{t('Sertifikat Relawan Kemanusiaan Resmi')}</strong>
                    <p className="text-gray-500 mt-1">{t('Pengakuan legalitas berkontribusi sosial resmi yang diakui tingkat kementerian.')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="home-volunteer-form-panel" className="md:col-span-5 bg-gray-50/50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-750 p-6 rounded-2xl space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <h4 className="font-extrabold text-gray-955 dark:text-white">{t('Pendaftaran Relawan')}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{t('Gabung barisan motor penggerak hari ini juga.')}</p>
              </div>

              {volInquirySuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                  <span className="font-bold block">{t('Selamat Bergabung!')}</span>
                  <p className="text-[11px]">{t('Lamaran Anda terdaftar. Tim koordinator relawan wilayah akan segera mengaktifkan status verifikasi Anda dan mengundang ke grup koordinasi penting.')}</p>
                  <button 
                    onClick={() => setVolInquirySuccess(false)}
                    className="bg-white hover:bg-gray-100 text-emerald-800 font-extrabold px-3 py-1 rounded border text-[10px]"
                  >
                    {t('Daftar baru')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVolunteerForm} className="space-y-3 font-xs">
                  <div>
                    <label className="block font-bold mb-1">{t('1. Nama Lengkap Relawan')}</label>
                    <input
                      type="text"
                      required
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder={t('Contoh: Aditya Nugroho')}
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">{t('Email')}</label>
                      <input
                        type="email"
                        required
                        value={volEmail}
                        onChange={(e) => setVolEmail(e.target.value)}
                        placeholder="adit@relawan.net"
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">{t('No. WhatsApp')}</label>
                      <input
                        type="text"
                        required
                        value={volPhone}
                        onChange={(e) => setVolPhone(e.target.value)}
                        placeholder="0856XXXXXXXX"
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t('Spesialisasi Keahlian Relawan')}</label>
                    <div className="grid grid-cols-2 gap-2 font-medium mt-1">
                      {['Penyuluh Pendidikan', 'Penyalur Logistik Medis', 'Dokumentasi/Kamera', 'Supir Darurat SAR'].map(skill => (
                        <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={volSkills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                            className="accent-emerald-600 rounded"
                          />
                          <span>{t(skill)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t('Deskripsi Ringkas Pengalaman Sosial')}</label>
                    <textarea
                      rows={2}
                      value={volExperience}
                      onChange={(e) => setVolExperience(e.target.value)}
                      placeholder={t('Contoh: Pernah mengikuti satgas peduli Gempa Cianjur 2 minggu bagian logistik masakan dhuafa...')}
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {t('Kirim Lamaran Relawan')}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* SECTION BLOG NEWS */}
          <section id="section-blog" className="scroll-mt-24 space-y-8 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-150 dark:border-gray-750">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-emerald-600 dark:text-emerald-455 text-xs font-black uppercase block tracking-wider">{t('KABAR EDUKASI MASLAHAT')}</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white tracking-tight font-sans">{t('Kanal Edukasi Kebaikan Yayasan')}</h2>
              <p className="text-xs text-gray-400">{t('Ikuti kupasan syariat zakat mal, transparansi filantropi, dan info update krisis air bersih.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-5 flex flex-col sm:flex-row gap-5 items-start hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-36 h-36 rounded-2xl bg-gray-100 dark:bg-gray-800 select-none pointer-events-none overflow-hidden shrink-0">
                    <img 
                      src={post.thumbnailUrl || post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-xs flex flex-col justify-between h-full grow leading-relaxed">
                    <div className="space-y-1.5 font-medium">
                      <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                        {t(post.category)}
                      </span>
                      <h3 className="font-extrabold text-sm text-gray-955 dark:text-white leading-snug tracking-tight font-sans">
                        {t(post.title)}
                      </h3>
                      <p className="text-gray-500 line-clamp-2">
                        {t(post.excerpt)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-t-gray-100 dark:border-t-gray-800 flex items-center justify-between text-[10px] text-gray-400 mt-2">
                      <span>{t('Oleh')}: {post.author}</span>
                      <span>{new Date(post.createdDate || post.publishedDate).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION TESTIMONI (4 CARD) */}
          <section id="section-testimoni" className="scroll-mt-24 space-y-8 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl p-6 md:p-10 shadow-sm transition-colors">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-emerald-600 dark:text-emerald-450 text-xs font-black uppercase block tracking-wider">{t('TESTIMONI DONATUR & MITRA')}</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white tracking-tight font-sans">{t('Kata Mereka tentang Amanah')}</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{t('Bukti nyata transparansi digital, amanah, dan dampak sosial yang terukur secara nyata di lapangan.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'H. Hendra Wijaya',
                  role: 'Donatur Zakat Maal',
                  location: 'Jakarta',
                  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
                  content: 'Sistem digital ledger real-time dari Amanah sangat luar biasa. Saya bisa langsung melihat dana zakat maal saya disalurkan ke program beasiswa dhuafa dalam hitungan jam. Transparansi seperti ini yang dicari umat.'
                },
                {
                  name: 'Ibu Ratna Kartika',
                  role: 'Mitra CSR Korporasi',
                  location: 'Bandung',
                  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
                  content: 'Kami bermitra dengan Amanah untuk program pengadaan sumur bor air bersih di daerah kekeringan. Laporan dampak kualitatif sangat komprehensif, dilengkapi data sains dan kuitansi transparan.'
                },
                {
                  name: 'Zaki Al-Ghifari',
                  role: 'Relawan Kemanusiaan',
                  location: 'Surabaya',
                  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
                  content: 'Menjadi bagian dari tim relawan tanggap darurat Amanah membuka mata saya tentang pentingnya ketulusan. Semua penyaluran diatur dengan integritas tinggi dan langsung menyentuh penerima manfaat di lapangan.'
                },
                {
                  name: 'Siti Rahma',
                  role: 'Penerima Manfaat Santri',
                  location: 'Sukabumi',
                  avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
                  content: 'Alhamdulillah, berkat beasiswa penuh dan asrama dari Amanah Impact Foundation, saya dapat melanjutkan sekolah ke jenjang menengah kejuruan. Terima kasih para donatur dan yayasan!'
                }
              ].map((testi, idx) => (
                <div key={idx} className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl border border-gray-150 dark:border-gray-750 p-5 flex flex-col justify-between hover:shadow-md transition-all relative group">
                  <Quote className="absolute top-4 right-4 w-7 h-7 text-emerald-100 dark:text-emerald-900/20 opacity-40 group-hover:scale-110 transition-transform" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-550 dark:text-gray-400 italic leading-relaxed font-medium">
                      "{t(testi.content)}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3.5 border-t border-gray-150 dark:border-gray-750 mt-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden shrink-0 select-none pointer-events-none">
                      <img src={testi.avatarUrl} alt={testi.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <strong className="text-[11px] font-extrabold text-gray-905 dark:text-white block tracking-tight leading-tight">{testi.name}</strong>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-455 block font-bold leading-none mt-0.5">{t(testi.role)}</span>
                      <span className="text-[9px] text-gray-400 block font-medium leading-none mt-0.5">{t(testi.location)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION CTA (CALL TO ACTION) */}
          <section id="section-cta" className="scroll-mt-24 relative overflow-hidden rounded-3xl bg-radial from-emerald-800 to-slate-900 text-white p-8 md:p-12 text-center flex flex-col items-center">
            {/* Ambient background decoration */}
            <div className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200')" }}></div>
            
            <div className="max-w-2xl relative z-10 space-y-6">
              <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
                {t('MARI BERGABUNG SEKARANG')}
              </span>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                {t('Siap Menjadi Motor Penggerak Kedaulatan Umat?')}
              </h2>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium max-w-lg mx-auto">
                {t('Setiap rupiah yang Anda zakatkan atau donasikan disalurkan murni 100% secara amanah dan tercatat secara transparan di public ledger. Gabung juga sebagai relawan kemanusiaan hari ini.')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => onOpenDonateModal()}
                  className="bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white animate-pulse" /> {t('Donasi Sekarang')}
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('navbar-item-volunteer');
                    if (el) {
                      el.click();
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-gray-700 font-bold text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  {t('Gabung Relawan')}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 2. ABOUT US VIEW */}
      {currentView === 'about' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-150 dark:border-gray-750 space-y-10 text-gray-700 dark:text-gray-300">
          
          {/* Mission statements */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-extrabold tracking-widest block">{t('SIAPAKAH KAMI')}</span>
            <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('Menjembatani Kepedulian, Merajut Kemandirian Berkelanjutan')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed leading-normal">
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{t('Visi Yayasan')}</h4>
              <p>
                {t('Menjadi episentrum pemberdayaan masyarakat dhuafa dan tata kelola dana sosial Islam (Zakat, Infaq, Sedekah, Wakaf) terdepan di Indonesia yang berorientasi sains, akuntabilitas digital berlapis, dan berkelanjutan ekologis.')}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{t('Definisi Naskah Legalitas')}</h4>
              <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl font-mono text-[10px] space-y-1 select-all border border-gray-100 dark:border-gray-800">
                <span className="block"><strong>{t('SK Kemenkumham:')}</strong> AHU-00123.AH.01.04 TAHUN 2024</span>
                <span className="block"><strong>{t('Reg Dinsos RI:')}</strong> 312/DINSOS-PP/2025</span>
                <span className="block"><strong>{t('NPWP Lembaga:')}</strong> 45.123.456.7-012.000</span>
                <span className="block"><strong>{t('Opini Keuangan:')}</strong> {t('WTP (Wajar Tanpa Pengecualian) audit independen')}</span>
              </p>
            </div>
          </div>

          {/* Dewan Pembina list */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
            <div className="text-center md:text-left shrink-0">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider block uppercase">{t('Dewan Direksi & Syariah')}</span>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{t('Struktur Kepemimpinan Amanah')}</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
              {[
                { name: 'Prof. Dr. KH. Ahmad Fauzi, M.A', role: 'Dewan Pengawas Syariah' },
                { name: 'Ir. H. Budi Santoso, M.B.A', role: 'Direktur Eksekutif Yayasan' },
                { name: 'Dr. Siti Aminah, S.E, M.Si', role: 'Kepala Bidang Akuntansi & Audit' },
                { name: 'H. Muhammad Ridwan, Lc', role: 'Amil Zakat & Wakaf Syariah' }
              ].map(board => (
                <div key={board.name} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-850">
                  <span className="font-extrabold text-gray-900 dark:text-white block tracking-tight leading-snug">{t(board.name)}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-1">{t(board.role)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. CAMPAIGNS LIST VIEW */}
      {currentView === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white tracking-tight">{t('Katalog Program Amanah')}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('Eksplorasi target sedia, zakat, reboisasi ataupun bantuan kemanusiaan.')}</p>
            </div>

            {/* Search inputs */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={campSearch}
                onChange={(e) => setCampSearch(e.target.value)}
                placeholder={t('Cari program kemanusiaan...')}
                className="bg-transparent text-xs outline-none focus:ring-0 text-slate-800 dark:text-white placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-1.5 pb-2 shrink-0 overflow-x-auto">
            {['Semua', 'Pendidikan', 'Wakaf', 'Pangan', 'Air Bersih', 'Kesehatan', 'Bencana'].map(catFilter => (
              <button
                key={catFilter}
                id={`camp-filter-btn-${catFilter}`}
                onClick={() => setActiveCategoryFilter(catFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeCategoryFilter === catFilter
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white hover:bg-emerald-50 dark:bg-gray-850 text-gray-600 dark:text-gray-350 border border-gray-150 dark:border-gray-750'
                }`}
              >
                {t(catFilter)}
              </button>
            ))}
          </div>

          {/* Catalog display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns
              .filter(c => activeCategoryFilter === 'Semua' || c.category === activeCategoryFilter)
              .filter(c => c.title.toLowerCase().includes(campSearch.toLowerCase()) || c.shortDescription.toLowerCase().includes(campSearch.toLowerCase()))
              .map(c => {
                const percent = Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100));

                return (
                  <div key={c.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-750 overflow-hidden flex flex-col justify-between hover:shadow-lg dark:shadow-none transition-shadow group">
                    <div className="relative h-44 bg-slate-900 overflow-hidden select-none">
                      <img 
                        src={c.thumbnailUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600'} 
                        alt={c.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-650 text-white font-extrabold text-[9px] px-2.5 py-1 rounded uppercase tracking-wider">
                        {t(c.category)}
                      </span>
                    </div>

                    <div className="p-5 grow space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => onSelectCampaign(c.slug)}
                          className="font-extrabold text-sm text-gray-950 dark:text-white leading-snug block hover:text-emerald-600 transition-colors text-left line-clamp-2"
                        >
                          {t(c.title)}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {t(c.shortDescription)}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-750">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                          <span>{langPack.collected}: <strong>{formatCurrency(c.collectedAmount)}</strong></span>
                          <span className="font-bold text-gray-800 dark:text-white">{percent}%</span>
                        </div>

                        <div className="w-full bg-gray-100 dark:bg-gray-750 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                          <span>Target: {formatCurrency(c.targetAmount)}</span>
                          <span>{t(c.location)}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2 shrink-0">
                        <button
                          onClick={() => onSelectCampaign(c.slug)}
                          className="flex-1 bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-white font-bold py-2 px-3 rounded-xl hover:bg-gray-200 text-xs transition-colors"
                        >
                          {t('Detail')}
                        </button>
                        <button
                          onClick={() => onOpenDonateModal(c.slug)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition-colors"
                        >
                          {t('Bantu Sekarang')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. TRANSPARENCY & REPORTS VIEW */}
      {currentView === 'transparency' && (
        <div id="transparency-board" className="space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2.5">
            <span className="text-xs uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider block">{t('MUTASI KUNCI')}</span>
            <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white">{t('Pertanggungjawaban Finansial Publik')}</h2>
            <p className="text-xs text-gray-400 leading-normal">
              {t('Yayasan menyajikan ledger penerimaan dana masuk (ledger transaksi) lunas publik secara seketika gunanya menjamin transparansi tinggi 100% bebas dari rekayasa keuangan.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 p-5 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold block">{t('Total Akuntabilitas Ledger')}</span>
              <strong className="text-2xl font-mono text-emerald-700 dark:text-emerald-400 block mt-1">{t('100% TERBUKA')}</strong>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 p-5 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold block">{t('Sertifikat Audit Keuangan')}</span>
              <strong className="text-2xl font-mono text-gray-955 dark:text-white block mt-1">{t('Rating WTP RI')}</strong>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 p-5 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold block">{t('Metrik Penyaluran Dampak')}</span>
              <strong className="text-2xl font-mono text-teal-600 block mt-1">{t('Sains & Terbimbing')}</strong>
            </div>
          </div>

          {/* Ledger mapping list */}
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl p-6 md:p-8 space-y-4">
            <div>
              <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-455 block">{t('Real-Time Ledger Transaksi Publik')}</span>
              <span className="text-[10px] text-gray-500 block">{t('Jurnal mutasi ini diperbarui secara instan begitu kontribusi Anda tuntas diterima oleh sistem perbankan.')}</span>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 text-slate-600 font-extrabold border-b border-gray-300">
                    <th className="p-3">{t('Waktu Masuk')}</th>
                    <th className="p-3">{t('Ref ID')}</th>
                    <th className="p-3">{t('Nama Donatur')}</th>
                    <th className="p-3">{t('Alokasi Penyaluran Program')}</th>
                    <th className="p-3">{t('Jumlah Dana')}</th>
                    <th className="p-3 text-right">{t('Verifikasi')}</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.filter(d => d.status === 'success').map(tx => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-emerald-50/5 text-xs text-gray-600 dark:text-gray-300">
                      <td className="p-3 font-mono text-[10px]">
                        {new Date(tx.createdDate).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-500">{tx.id}</td>
                      <td className="p-3 font-bold">
                        {tx.isAnonymous ? t('Hamba Allah') : tx.donorName}
                      </td>
                      <td className="p-3 font-semibold truncate max-w-[150px]" title={tx.campaignTitle}>
                        {t(tx.campaignTitle)}
                      </td>
                      <td className="p-3 font-extrabold text-gray-900 dark:text-white">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                          {t('APPROVED')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. CSR PARTNERS VIEW */}
      {currentView === 'csr' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">
          
          <div className="md:col-span-7 space-y-6">
            <span className="text-emerald-600 dark:text-emerald-450 text-xs font-black uppercase block tracking-wider">{t('CSR & ESG SOLUTIONS PARTNERSHIP')}</span>
            <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white leading-snug tracking-tight">
              {t('Tingkatkan Dampak ESG Perusahaan Anda Bersama Kami')}
            </h2>
            <p className="leading-relaxed leading-normal">
              {t('Kami menyusun kemitraan program berkelanjutan siap saji didukung oleh infografis audit, dokumentasi foto, kuitansi digital, serta verifikasi laporan dampak yang patuh terhadap kualifikasi kriteria GRI (Global Reporting Initiative) & ESG.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-905 p-4 rounded-xl border border-gray-100.5">
                <span className="font-extrabold text-gray-900 dark:text-white text-xs block mb-1">{t('Penyalur Terakreditasi B')}</span>
                <p className="text-gray-500">{t('Seluruh berita acara diautentikasi resmi menteri sosial & amil.')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-905 p-4 rounded-xl border border-gray-100.5">
                <span className="font-extrabold text-gray-900 dark:text-white text-xs block mb-1">{t('Tailored ESG Dashboard')}</span>
                <p className="text-gray-500">{t('Dashboard digital kustom korporasi guna paparan direksi RUPS.')}</p>
              </div>
            </div>
          </div>

          <div id="csr-form-panel" className="md:col-span-5 bg-gray-50/50 dark:bg-gray-900/60 border border-gray-200 p-6 rounded-2xl space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h4 className="font-extrabold text-gray-900 dark:text-white">{t('Formulir Kolaborasi CSR')}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('Ajukan konsultasi program ESG korporat, tim kami akan menjadwalkan meeting dalam 1x24 jam.')}</p>
            </div>

            {csrInquirySuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                <span className="font-bold block">{t('Terima Kasih, Mitra CSR!')}</span>
                <p className="text-[11px]">{t('Prospektus kolaborasi dan proposal program kerja sedia terkirim ke email, tim amil segera menghubungi WhatsApp Anda.')}</p>
                <button 
                  onClick={() => setCsrInquirySuccess(false)}
                  className="bg-white hover:bg-gray-100 text-emerald-800 font-extrabold px-3 py-1 rounded border text-[10px]"
                >
                  {t('Ajukan Lagi')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCsrForm} className="space-y-3 font-xs">
                <div>
                  <label className="block font-bold mb-1">{t('1. Nama Perusahaan / Korporasi')}</label>
                  <input
                    type="text"
                    required
                    value={csrCompany}
                    onChange={(e) => setCsrCompany(e.target.value)}
                    placeholder={t('Contoh: PT Angkasa Raya Tbk')}
                    className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('2. Nama Lengkap PIC Perusahaan')}</label>
                  <input
                    type="text"
                    required
                    value={csrPic}
                    onChange={(e) => setCsrPic(e.target.value)}
                    placeholder={t('Contoh: Ibu Ranti Safitri')}
                    className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">{t('Phone / WA PIC')}</label>
                    <input
                      type="text"
                      required
                      value={csrPhone}
                      onChange={(e) => setCsrPhone(e.target.value)}
                      placeholder="0812XXXXXXXX"
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">{t('Alamat Email Kerja')}</label>
                    <input
                      type="email"
                      value={csrEmail}
                      onChange={(e) => setCsrEmail(e.target.value)}
                      placeholder="pic@corporate.com"
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('Pilar Program yang Diminati')}</label>
                  <select
                    value={csrProgram}
                    onChange={(e) => setCsrProgram(e.target.value)}
                    className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                  >
                    <option value="Pendidikan Mandiri">{t('Beasiswa Santri & Asrama Yatim')}</option>
                    <option value="Air Bersih">{t('Sumur Bor Produktif Krisis Air')}</option>
                    <option value="Kesehatan Tangguh">{t('Klinik Kesehatan Keliling Dhuafa')}</option>
                    <option value="Reboisasi">{t('Mitigasi Emisi Karbon Green Reboisasi')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('Target Anggaran Kemitraan')}</label>
                  <select
                    value={csrBudget}
                    onChange={(e) => setCsrBudget(e.target.value)}
                    className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                  >
                    <option value="Rp50juta - Rp100juta">{t('Rp50 Juta - Rp100 Juta')}</option>
                    <option value="Rp100juta - Rp250juta">{t('Rp100 Juta - Rp250 Juta')}</option>
                    <option value="Rp250juta_plus">{t('Di atas Rp250 Juta')}</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-submit-csr-inquiry"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {t('Ajukan Kemitraan ESG')}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* 6. VOLUNTEER REGISTER VIEW */}
      {currentView === 'volunteer' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 border border-gray-150 dark:border-gray-750">
          
          <div className="md:col-span-7 space-y-6">
            <span className="text-emerald-600 dark:text-emerald-455 text-xs font-black uppercase block tracking-wider">{t('JOIN AMANAH FORCE')}</span>
            <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white leading-snug tracking-tight">
              {t('Ayo Ambil Peran dalam Barisan Penggerak Kebaikan')}
            </h2>
            <p className="leading-relaxed leading-normal">
              {t('Yayasan membuka seluas-luasnya peluang kontribusi kebahagiaan para pemuda Indonesia untuk terjun sebagai tim relawan lapangan penanggulangan kekeringan, edukasi mengajar mengaji pelosok, pendataan logistik bantuan bencana, murni tanpa pamrih demi kemanusiaan mulia.')}
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white">{t('Pelatihan Kesiapsiagaan Darurat')}</strong>
                  <p className="text-gray-500 mt-1">{t('Dapatkan pembekalan kompetensi SAR, mitigasi bencana psikososial anak dari para profesional.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white">{t('Sertifikat Relawan Kemanusiaan Resmi')}</strong>
                  <p className="text-gray-500 mt-1">{t('Pengakuan legalitas berkontribusi sosial resmi yang diakui tingkat kementerian.')}</p>
                </div>
              </div>
            </div>
          </div>

          <div id="volunteer-form-panel" className="md:col-span-5 bg-gray-50/50 dark:bg-gray-900/60 border border-gray-200 p-6 rounded-2xl space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h4 className="font-extrabold text-gray-900 dark:text-white">{t('Pendaftaran Relawan')}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('Gabung barisan motor penggerak hari ini juga.')}</p>
            </div>

            {volInquirySuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                <span className="font-bold block">{t('Selamat Bergabung!')}</span>
                <p className="text-[11px]">{t('Lamaran Anda terdaftar. Tim koordinator relawan wilayah akan segera mengaktifkan status verifikasi Anda dan mengundang ke grup koordinasi penting.')}</p>
                <button 
                  onClick={() => setVolInquirySuccess(false)}
                  className="bg-white hover:bg-gray-100 text-emerald-800 font-extrabold px-3 py-1 rounded border text-[10px]"
                >
                  {t('Daftar baru')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVolunteerForm} className="space-y-3 font-xs">
                <div>
                  <label className="block font-bold mb-1">{t('1. Nama Lengkap Lambang Relawan')}</label>
                  <input
                    type="text"
                    required
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    placeholder={t('Contoh: Aditya Nugroho')}
                    className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">{t('Email')}</label>
                    <input
                      type="email"
                      required
                      value={volEmail}
                      onChange={(e) => setVolEmail(e.target.value)}
                      placeholder="adit@relawan.net"
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">{t('No. WhatsApp')}</label>
                    <input
                      type="text"
                      required
                      value={volPhone}
                      onChange={(e) => setVolPhone(e.target.value)}
                      placeholder="0856XXXXXXXX"
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('Spesialisasi Keahlian Relawan')}</label>
                  <div className="grid grid-cols-2 gap-2 font-medium mt-1">
                    {['Penyuluh Pendidikan', 'Penyalur Logistik Medis', 'Dokumentasi/Kamera', 'Supir Darurat SAR'].map(skill => (
                      <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={volSkills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="accent-emerald-600 rounded"
                        />
                        <span>{t(skill)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('Deskripsi Ringkas Pengalaman Sosial')}</label>
                  <textarea
                    rows={2}
                    value={volExperience}
                    onChange={(e) => setVolExperience(e.target.value)}
                    placeholder={t('Contoh: Pernah mengikuti satgas peduli Gempa Cianjur 2 minggu bagian logistik masakan dhuafa...')}
                    className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-volunteer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {t('Kirim Lamaran Relawan')}
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* 7. EDUCATIONAL BLOGS VIEW */}
      {currentView === 'blog' && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-emerald-600 dark:text-emerald-455 text-xs font-black uppercase block tracking-wider">{t('KABAR EDUKASI MASLAHAT')}</span>
            <h2 className="text-xl md:text-3xl font-black text-gray-955 dark:text-white tracking-tight">{t('Kanal Edukasi Kebaikan Yayasan')}</h2>
            <p className="text-xs text-gray-400">{t('Ikuti kupasan syariat zakat mal, transparansi filantropi, dan info update krisis air bersih.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map(post => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-750 p-5 flex flex-col sm:flex-row gap-5 items-start hover:shadow-md transition-shadow">
                <div className="w-full sm:w-36 h-36 rounded-2xl bg-gray-100 select-none pointer-events-none overflow-hidden shrink-0">
                  <img 
                    src={post.thumbnailUrl || post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-xs flex flex-col justify-between h-full grow leading-relaxed">
                  <div className="space-y-1.5">
                    <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                      {t(post.category)}
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-955 dark:text-white leading-snug tracking-tight">
                      {t(post.title)}
                    </h3>
                    <p className="text-gray-500 line-clamp-2">
                      {t(post.excerpt)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-t-gray-100 dark:border-t-gray-750 flex items-center justify-between text-[10px] text-gray-400 mt-2">
                    <span>{t('Oleh')}: {post.author}</span>
                    <span>{new Date(post.createdDate || post.publishedDate).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
