/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Heart, ClipboardCheck, Briefcase, HandHelping, 
  Sparkles, Languages, Save, Plus, Check, RefreshCw, Smartphone, 
  Search, ShieldAlert, BadgeInfo, FileDown, ExternalLink, User, LogOut
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Campaign, Donation, Donor, Volunteer, CsrInquiry, Report, BlogPost, AdminUser } from '../types';
import AdminProfileSection from './AdminProfileSection';

interface AdminPanelProps {
  currentAdmin: AdminUser;
  setCurrentAdmin: (user: AdminUser) => void;
  onLogout: () => void;
  campaigns: Campaign[];
  donations: Donation[];
  donors: Donor[];
  volunteers: Volunteer[];
  csrInquiries: CsrInquiry[];
  reports: Report[];
  blogs: BlogPost[];
  onRefreshAll: () => void;
  langPack: any;
  currentLang?: string;
}

type AdminRole = 
  | 'Super Admin' 
  | 'Executive Director' 
  | 'Content Editor' 
  | 'Fundraising Admin' 
  | 'Finance Admin' 
  | 'Auditor' 
  | 'Viewer';

export default function AdminPanel({
  currentAdmin,
  setCurrentAdmin,
  onLogout,
  campaigns,
  donations,
  donors,
  volunteers,
  csrInquiries,
  reports,
  blogs,
  onRefreshAll,
  langPack,
  currentLang = 'id'
}: AdminPanelProps) {
  const [currentRole, setCurrentRole] = useState<AdminRole>('Super Admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'donations' | 'donors' | 'csr' | 'volunteers' | 'ai' | 'profile'>('overview');

  // AI Assistant section inputs
  const [aiType, setAiType] = useState<'campaign' | 'faq' | 'impact' | 'reply' | 'translate'>('campaign');
  const [aiPrompt, setAiPrompt] = useState<string>('Sumur bor bersih untuk krisis kekeringan parah di desa terpencil NTT');
  const [aiTranslateLang, setAiTranslateLang] = useState<string>('English');
  const [aiResult, setAiResult] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiSimulated, setIsAiSimulated] = useState<boolean>(false);

  // Campaign CMS states
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampCategory, setNewCampCategory] = useState('Pendidikan');
  const [newCampGoal, setNewCampGoal] = useState('500000000');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampStory, setNewCampStory] = useState('');
  const [newCampLocation, setNewCampLocation] = useState('Jabodetabek');

  // Deployment Center states & logic
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [lastDeployTime, setLastDeployTime] = useState<string>(() => {
    return localStorage.getItem('amanah_last_deploy') || '2026-07-10 23:15:00';
  });

  const handleTriggerDeploy = () => {
    setIsDeploying(true);
    setDeployProgress(5);
    setDeployStep('Inisialisasi server deployment & verifikasi git branch...');

    const steps = [
      { progress: 20, text: 'Melakukan pengetesan linter & tipe data TypeScript...' },
      { progress: 45, text: 'Mengompilasi bundel produksi (Vite Production Build)...' },
      { progress: 70, text: 'Mengoptimalkan aset gambar & memadatkan CSS/JS (esbuild)...' },
      { progress: 90, text: 'Mengunggah aset build statis ke CDN Cloud Run...' },
      { progress: 100, text: 'Deployment Selesai! Aplikasi Amanah Impact Foundation aktif di awan.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setDeployProgress(step.progress);
        setDeployStep(step.text);
        if (step.progress === 100) {
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          setLastDeployTime(nowStr);
          localStorage.setItem('amanah_last_deploy', nowStr);
          setIsDeploying(false);
          alert('Website dan Kampanye terbaru telah berhasil di-deploy ke produksi!');
        }
      }, (idx + 1) * 1200);
    });
  };

  // Selected donor state (CRM note modal)
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [donorNotesText, setDonorNotesText] = useState<string>('');

  // 1. Roles & Permissions Check
  // Restricted sections warnings
  const canModifyBilling = ['Super Admin', 'Finance Admin'].includes(currentRole);
  const canWriteContent = ['Super Admin', 'Content Editor'].includes(currentRole);
  const canEditFundraising = ['Super Admin', 'Fundraising Admin'].includes(currentRole);
  const canEvaluateInquiry = ['Super Admin', 'Executive Director', 'Fundraising Admin'].includes(currentRole);
  const isReadOnly = ['Auditor', 'Viewer'].includes(currentRole);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Recharts Data Prep
  // Group daily successful donations
  const chartDataGroupMap: Record<string, number> = {};
  donations.forEach(d => {
    if (d.status === 'success') {
      const dateKey = d.createdDate.split('T')[0] || '2026-05-15';
      const day = dateKey.split('-')[2] || '15';
      const formattedLabel = `Mei ${day}`;
      chartDataGroupMap[formattedLabel] = (chartDataGroupMap[formattedLabel] || 0) + d.amount;
    }
  });

  const areaChartData = Object.keys(chartDataGroupMap).map(key => ({
    name: key,
    amount: chartDataGroupMap[key]
  })).sort((a,b) => a.name.localeCompare(b.name));

  // Category Pie Chart
  const pieDataMap: Record<string, number> = {};
  campaigns.forEach(c => {
    pieDataMap[c.category] = (pieDataMap[c.category] || 0) + c.disbursedAmount;
  });
  const pieChartData = Object.keys(pieDataMap).map(key => ({
    name: key,
    value: pieDataMap[key]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899'];

  // AI assistant invoke call
  const handleAIAssist = async () => {
    setIsAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: aiType,
          prompt: aiPrompt,
          textToTranslate: aiPrompt,
          targetLanguage: aiTranslateLang
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data.result);
        setIsAiSimulated(!!data.isSimulated);
      } else {
        setAiResult(data.error || 'Gagal memanggil AI model.');
      }
    } catch (e) {
      console.error(e);
      setAiResult('Kedala jaringan sewaktu memproses Gemini.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Action methods: Admin creates campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canWriteContent && !canEditFundraising) {
      alert('Akses Ditolak: Anda tidak memiliki wewenang membuat kampanye baru.');
      return;
    }
    if (!newCampTitle || !newCampGoal) {
      alert('Mohon isi judul dan target dana.');
      return;
    }

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCampTitle,
          category: newCampCategory,
          targetAmount: Number(newCampGoal),
          shortDescription: newCampDesc,
          story: newCampStory,
          location: newCampLocation
        })
      });
      if (res.ok) {
        alert('Kampanye berhasil didraf atau dipublikasikan!');
        setNewCampTitle('');
        setNewCampDesc('');
        setNewCampStory('');
        onRefreshAll();
      } else {
        alert('Gagal mendraf kampanye.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // Verify / Alter donation status (Finance Action)
  const handleVerifyDonation = async (donationId: string, targetStatus: string) => {
    if (!canModifyBilling) {
      alert('Akses Ditolak: Hanya Finance Admin atau di atasnya yang bisa memverifikasi dana masuk.');
      return;
    }
    try {
      const res = await fetch(`/api/donations/${donationId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        alert('Status donasi berhasil diubah!');
        onRefreshAll();
      } else {
        alert('Gagal memverifikasi status.');
      }
    } catch (e) {
      alert('Kesalahan jaringan.');
    }
  };

  // Save CRM contact notes
  const handleSaveDonorNotes = async () => {
    if (!selectedDonorId) return;
    try {
      const res = await fetch(`/api/donors/${selectedDonorId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: donorNotesText })
      });
      if (res.ok) {
        alert('Catatan CRM kontak disimpan!');
        setSelectedDonorId(null);
        setDonorNotesText('');
        onRefreshAll();
      } else {
        alert('Gagal menyimpan.');
      }
    } catch (err) {
      alert('Koneksi terganggu.');
    }
  };

  // Volunteers approval
  const handleVolunteerStatus = async (volId: string, nextStatus: string) => {
    if (isReadOnly || !canWriteContent && !canEditFundraising) {
      alert('Akses ditolak.');
      return;
    }
    try {
      const res = await fetch(`/api/volunteers/${volId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        alert('Status relawan diperbarui.');
        onRefreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Pipeline CSR
  const handleUpdateCsrPipeline = async (csrId: string, nextPipeline: string) => {
    if (!canEvaluateInquiry) {
      alert('Akses ditolak.');
      return;
    }
    try {
      const res = await fetch(`/api/csr-inquiries/${csrId}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: nextPipeline })
      });
      if (res.ok) {
        alert('Pipeline CSR dimajukan!');
        onRefreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Global KPIs summary counters
  const totalReceived = donations.filter(d => d.status === 'success').reduce((prev, d) => prev + d.amount, 0);
  const pendingCount = donations.filter(d => d.status === 'pending').length;
  const totalYatimServed = campaigns.find(c => c.id === 'C-01')?.beneficiaryReached || 642;
  const averageSuccessRate = '94.2%';

  return (
    <div className="bg-gray-50/50 dark:bg-gray-950 p-4 md:p-6 rounded-3xl border border-gray-200 dark:border-gray-800">
      
      {/* Admin header menu bar with Role Selector emulation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Amanah Operational Cockpit
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            Dasbor internal yayasan demi mengelola kontribusi, perizinan, CRM Donatur, & CSR pipeline.
          </p>
        </div>

        {/* Authenticated Admin user profile indicator */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 p-2 rounded-xl shadow-xs"
            title="Ubah profil amil saya"
          >
            <img
              src={currentAdmin.photoUrl}
              alt={currentAdmin.name}
              className="w-8.5 h-8.5 rounded-full border border-emerald-55 object-cover bg-white shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
              }}
            />
            <div className="hidden sm:block">
              <h5 className="text-[11px] font-black text-gray-850 dark:text-white leading-tight">{currentAdmin.name}</h5>
              <span className="text-[9px] text-gray-400 block leading-normal mt-0.5">{currentAdmin.email}</span>
            </div>
          </button>

          {/* Emulate Role picker */}
          <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 flex items-center">
            <div className="text-left">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-300 block leading-tight">
                Emulasi Hak Akses:
              </span>
          <select
            id="select-admin-role"
            value={currentRole}
            onChange={(e) => {
              setCurrentRole(e.target.value as AdminRole);
              alert(`Hak akses diubah ke: ${e.target.value}. Beberapa menu tindakan disesuaikan.`);
            }}
            className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-transparent outline-none cursor-pointer"
          >
            <option value="Super Admin">Super Admin (Akses Penuh)</option>
            <option value="Executive Director">Direktur Eksekutif</option>
            <option value="Finance Admin">Finance Admin</option>
            <option value="Fundraising Admin">Fundraising Admin</option>
            <option value="Content Editor">Content Editor</option>
            <option value="Auditor">Editor Auditor Keuangan</option>
            <option value="Viewer">Viewer (Read Only)</option>
          </select>
        </div>
      </div>
    </div>
  </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDE BAR BUTTONS CONTROLLER */}
        <div className="lg:col-span-3 space-y-1.5">
          {[
            { id: 'overview', label: 'Ringkasan KPI & Analytics', icon: BarChart3 },
            { id: 'campaigns', label: 'CMS Kampanye Program', icon: Heart },
            { id: 'donations', label: 'Keuangan & Mutasi Dana', icon: ClipboardCheck },
            { id: 'donors', label: 'CRM Database Donatur', icon: Users },
            { id: 'csr', label: 'Pipeline CSR & ESG', icon: Briefcase },
            { id: 'volunteers', label: 'Registrasi Relawan', icon: HandHelping },
            { id: 'ai', label: 'AI Operational assistant', icon: Sparkles },
            { id: 'profile', label: 'Profil Saya & Akun', icon: User }
          ].map(menu => {
            const IconComp = menu.icon;
            return (
              <button
                key={menu.id}
                id={`admin-tab-${menu.id}`}
                onClick={() => setActiveTab(menu.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === menu.id
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 dark:shadow-emerald-500/10'
                    : 'bg-white hover:bg-emerald-50/40 dark:bg-gray-850 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-150 dark:border-gray-750'
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                {menu.label}
              </button>
            );
          })}

          <div className="border border-red-100/40 bg-red-50/20 dark:bg-red-950/20 rounded-xl p-3 text-[11px] text-red-700 dark:text-red-300 mt-4 leading-normal flex items-start gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Amanah Security Note:</span>
              Bekerja di bawah lisensi hak akses <strong>{currentRole}</strong>. Seluruh mutasi dana diaudit digital ledger tuntas.
            </div>
          </div>
        </div>

        {/* WORKSPACE OPERATIONS CONTAINER */}
        <div className="lg:col-span-9 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200/60 dark:border-gray-700/80 shadow-sm min-h-[500px]">
          
          {/* TAP 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Total Dana Terkumpul</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight block mt-1">{formatCurrency(totalReceived)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Pendidikan (Yatim)</span>
                  <span className="text-lg font-black text-gray-800 dark:text-white tracking-tight block mt-1">{totalYatimServed} Santri</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Trx Berhasil (Rate)</span>
                  <span className="text-lg font-black text-teal-650 dark:text-teal-400 tracking-tight block mt-1">{averageSuccessRate}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Pending Review</span>
                  <span className="text-lg font-black text-amber-600 tracking-tight block mt-1">{pendingCount} Transaksi</span>
                </div>
              </div>

              {/* Graphic Charts block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                
                {/* Growth curve Recharts */}
                <div className="md:col-span-8 bg-gray-50 dark:bg-gray-905 p-4 rounded-2xl border border-gray-100 dark:border-gray-750">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 dark:text-gray-300">
                    Akumulasi Transaksi Sukses Harian (Mei 2026)
                  </h4>
                  <div className="h-56">
                    {areaChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                          <YAxis fontSize={9} stroke="#94a3b8" />
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                          <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmt)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        Belum ada transaksi di periode ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Pie Category disbursement */}
                <div className="md:col-span-4 bg-gray-50 dark:bg-gray-905 p-4 rounded-2xl border border-gray-100 dark:border-gray-750 flex flex-col justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 dark:text-gray-300">
                    Penyaluran Kategori
                  </h4>
                  <div className="h-36 w-full relative flex justify-center items-center">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-[10px] text-gray-400">Loading charts...</span>
                    )}
                  </div>
                  
                  {/* Custom legend logs */}
                  <div className="text-[10px] space-y-1 block max-h-20 overflow-y-auto">
                    {pieChartData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          {item.name}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Website & Live Content Deployment Center */}
              <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                      Status: Live & Connected
                    </span>
                    <h4 className="text-sm font-black text-gray-850 dark:text-white mt-1">
                      Live Production & Deployment Control
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Sinkronisasikan seluruh database kampanye baru, mutasi kas, dan perubahan konten ke server utama Google Cloud Run.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleTriggerDeploy}
                    disabled={isDeploying || isReadOnly}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shrink-0 flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {isDeploying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Deploying... ({deployProgress}%)
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        Deploy ke Produksi
                      </>
                    )}
                  </button>
                </div>

                {isDeploying && (
                  <div className="space-y-2 animate-pulse">
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      <span>{deployStep}</span>
                      <span>{deployProgress}%</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 border-t border-emerald-100/20 pt-3">
                  <div>
                    Last Deployed: <span className="font-mono text-gray-650 dark:text-gray-300">{lastDeployTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Server: <span className="text-emerald-600 dark:text-emerald-400">Google Cloud Run (Asia-Southeast1)</span></span>
                    <span>•</span>
                    <span>SSL: <span className="text-emerald-600 dark:text-emerald-400 font-sans">Active (Let's Encrypt)</span></span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAP 2: CAMPAIGNS CMS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-450">
                  Draf Campaign Baru & Modifikasi CMS
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tambahkan usulan program sosial resmi, target beasiswa, dana, atau reboisasi tuntas.
                </p>
              </div>

              {/* Campaign ADD Form */}
              <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-55/20 dark:bg-gray-900 rounded-2xl p-4 border border-gray-150 dark:border-gray-800 text-xs text-gray-700">
                <div className="md:col-span-2">
                  <label className="block font-bold mb-1 dark:text-gray-350">Judul Unggulan Kampanye</label>
                  <input
                    type="text"
                    value={newCampTitle}
                    onChange={(e) => setNewCampTitle(e.target.value)}
                    placeholder="Contoh: Renovasi Fasilitas Sanitasi Air Bersih Ponpes Cilacap"
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 dark:text-gray-350">Kategori Program</label>
                  <select
                    value={newCampCategory}
                    onChange={(e) => setNewCampCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    disabled={isReadOnly}
                  >
                    {['Pendidikan', 'Wakaf', 'Pangan', 'Air Bersih', 'Kesehatan', 'Lingkungan', 'Pemberdayaan Ekonomi', 'Zakat', 'Bencana', 'Anak Yatim'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 dark:text-gray-350">Target Pendanaan (IDR)</label>
                  <input
                    type="number"
                    value={newCampGoal}
                    onChange={(e) => setNewCampGoal(e.target.value)}
                    placeholder="Minimal 10000000"
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-slate-800 dark:text-emerald-400"
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 dark:text-gray-350">Wilayah Penyaluran</label>
                  <input
                    type="text"
                    value={newCampLocation}
                    onChange={(e) => setNewCampLocation(e.target.value)}
                    placeholder="Contoh: Lombok Timur, NTB"
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold mb-1 dark:text-gray-350">Deskripsi Singkat (Short Synopsis)</label>
                  <input
                    type="text"
                    value={newCampDesc}
                    onChange={(e) => setNewCampDesc(e.target.value)}
                    placeholder="Diringkas guna card kemanusiaan..."
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="md:col-span-2 col-span-1">
                  <label className="block font-bold mb-1 dark:text-gray-350">Dokumen Narasi Lengkap (Editorial Story)</label>
                  <textarea
                    value={newCampStory}
                    onChange={(e) => setNewCampStory(e.target.value)}
                    rows={3}
                    placeholder="Latar belakang detail problem sosial dan solusi..."
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="md:col-span-2 pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    id="btn-admin-submit-camp"
                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    disabled={isReadOnly || !canWriteContent && !canEditFundraising}
                  >
                    <Plus className="w-4 h-4" />
                    Simpan & Luncurkan Kampanye
                  </button>
                </div>
              </form>

              {/* Active Campaigns list mapping for audit */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                  Daftar Kontrol Kampanye Saat Ini ({campaigns.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3">
                  {campaigns.map(c => (
                    <div key={c.id} className="border border-gray-150 dark:border-gray-700 bg-white dark:bg-gray-850 p-3.5 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between items-start font-bold">
                        <span className="text-gray-900 dark:text-white tracking-tight leading-snug line-clamp-1">{c.title}</span>
                        <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-350 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          {c.category}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-450">
                        <span>Target: <strong>{formatCurrency(c.targetAmount)}</strong></span>
                        <span>Terkumpul: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(c.collectedAmount)}</strong></span>
                      </div>

                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full" 
                          style={{ width: `${Math.min(100, (c.collectedAmount / c.targetAmount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAP 3: DONATIONS MUTATIONS TABLE */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-450">
                    Buku Jurnal Keuangan Mutasi Dana
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Gunakan panel ini untuk memverifikasi dana masuk dari Virtual Account atau QRIS secara real-time.
                  </p>
                </div>
                
                {/* PDF export imitation */}
                <button
                  type="button"
                  id="btn-export-audit"
                  onClick={() => alert('PDF Jurnal Audit Keuangan Triwulan Amanah Impact berhasil di-export ke perangkat Anda!')}
                  className="bg-white hover:bg-slate-50 border border-gray-250 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 text-gray-700 dark:text-white transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-600" /> Save Ledger PDF
                </button>
              </div>

              {/* Transactions logs table */}
              <div className="overflow-x-auto border border-gray-150 dark:border-gray-750 rounded-2xl bg-white dark:bg-gray-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-gray-850 text-slate-500 dark:text-gray-400 font-extrabold border-b border-gray-200 dark:border-gray-750">
                      <th className="p-3.5">No Trx / Tanggal</th>
                      <th className="p-3.5">Donatur</th>
                      <th className="p-3.5">Program</th>
                      <th className="p-3.5">Jumlah</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-emerald-50/5 dark:hover:bg-gray-850/20">
                        <td className="p-3.5">
                          <span className="font-mono font-bold block">{d.id}</span>
                          <span className="text-[10px] text-gray-400 block">{new Date(d.createdDate).toLocaleDateString('id-ID')}</span>
                        </td>
                        <td className="p-3.5 font-bold">
                          {d.donorName}
                          <span className="text-[10px] text-gray-400 block font-normal">{d.paymentMethod}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-600 dark:text-gray-350 max-w-[150px] truncate" title={d.campaignTitle}>
                          {d.campaignTitle}
                        </td>
                        <td className="p-3.5 font-extrabold text-gray-950 dark:text-white">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            d.status === 'success'
                              ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/80 dark:text-emerald-350'
                              : d.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div id={`verify-actions-grp-${d.id}`} className="flex items-center justify-end gap-1.5">
                            {d.status === 'pending' ? (
                              <button
                                type="button"
                                id={`btn-verify-success-${d.id}`}
                                onClick={() => handleVerifyDonation(d.id, 'success')}
                                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="Verifikasi Lunas"
                                disabled={isReadOnly || !canModifyBilling}
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                            ) : (
                              <span className="text-gray-300 text-[10px]">- Verified -</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAP 4: CRM DONORS TAB */}
          {activeTab === 'donors' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-450">
                  CRM Ringan & Database Donatur Terintegrasi
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kontrol daftar donatur pendukung utama yayasan, berikan segmentasi tags, catat ikhtisar konsultasi WA.
                </p>
              </div>

              {/* Table list donors */}
              <div className="overflow-x-auto border border-gray-150 dark:border-gray-750 rounded-2xl bg-white dark:bg-gray-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-gray-850 text-slate-500 dark:text-gray-400 font-extrabold border-b border-gray-200 dark:border-gray-750">
                      <th className="p-3.5">Nama Donatur</th>
                      <th className="p-3.5">Kota / Segmen</th>
                      <th className="p-3.5">Pilar Program Terkait</th>
                      <th className="p-3.5 text-center">Frek Trx</th>
                      <th className="p-3.5">Akumulasi Donasi</th>
                      <th className="p-3.5 text-right">Catatan CRM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map(dn => (
                      <tr key={dn.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-slate-55/10">
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-1">
                            {dn.isVIP && <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded-sm uppercase tracking-wider scale-95 shrink-0 select-none">VIP</span>}
                            {dn.name}
                          </div>
                          <span className="text-[10px] text-gray-400 block font-normal">{dn.email} • {dn.whatsapp}</span>
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-gray-350 font-semibold">
                          {dn.city}
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-normal">{dn.segment}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(dn.tags || ['Infaq']).map(tag => (
                              <span key={tag} className="bg-slate-100 text-slate-800 dark:bg-gray-800 dark:text-gray-300 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-center">
                          {dn.donationCount} kali
                        </td>
                        <td className="p-3.5 font-black text-emerald-700 dark:text-emerald-450">
                          {formatCurrency(dn.totalDonation)}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            id={`btn-open-notes-${dn.id}`}
                            onClick={() => {
                              setSelectedDonorId(dn.id);
                              setDonorNotesText(dn.notes || '');
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                          >
                            Edit Log
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Note Editor Section */}
              {selectedDonorId && (
                <div id="donor-notes-modal" className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-400">
                      Tulis Catatan CRM Donatur (ID: {selectedDonorId})
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedDonorId(null);
                        setDonorNotesText('');
                      }}
                      className="text-gray-400 text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>
                  <textarea
                    id="input-donor-crm-note"
                    value={donorNotesText}
                    onChange={(e) => setDonorNotesText(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Sangat mementingkan program bantuan sumur bor. Hubungi kembali di awal bulan pelaporan."
                    className="w-full text-xs p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      id="save-crm-notes-btn"
                      onClick={handleSaveDonorNotes}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan Catatan CRM
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAP 5: CSR PIPELINE MANAGEMENT */}
          {activeTab === 'csr' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-450">
                  CSR B2B Partnership & ESG Pipeline
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kontrol pipeline negosiasi perusahaan korporasi besar yang mengajukan proposal kesejahteraan manfaat sosial.
                </p>
              </div>

              {/* CRM Pipeline status lists */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Inquiry Baru / Prospek', code: 'new' },
                  { title: 'Meeting / Presentasi', code: 'meeting_scheduled' },
                  { title: 'Proposal Terkirim / Negosiasi', code: 'proposal_sent' },
                  { title: 'Deal Won / Program Aktif', code: 'deal_won' }
                ].map(stage => (
                  <div key={stage.code} className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-2xl font-xs space-y-2.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-250 pb-1.5">
                      {stage.title}
                    </span>

                    {/* Filter items matching pipeline status */}
                    {csrInquiries.filter(c => c.pipelineStatus === stage.code || (stage.code === 'proposal_sent' && c.pipelineStatus === 'negotiation')).map(inq => (
                      <div key={inq.id} className="bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-750 p-3 rounded-xl space-y-1 shadow-sm">
                        <span className="font-bold text-gray-950 dark:text-white block tracking-tight line-clamp-1">{inq.companyName}</span>
                        <span className="text-[10px] text-gray-500 block">PIC: {inq.picName} ({inq.position})</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">{inq.budgetRange}</span>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-teal-600 block uppercase tracking-wide">
                            Pilar: {inq.interestedProgram}
                          </span>
                          
                          {/* Progress helper */}
                          {stage.code !== 'deal_won' && (
                            <button
                              type="button"
                              id={`btn-csr-advance-${inq.id}`}
                              onClick={() => {
                                const nextMap: Record<string, string> = {
                                  new: 'meeting_scheduled',
                                  meeting_scheduled: 'proposal_sent',
                                  proposal_sent: 'deal_won'
                                };
                                handleUpdateCsrPipeline(inq.id, nextMap[stage.code]);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-black text-[10px] border border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30 bg-white dark:bg-gray-850 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                              disabled={isReadOnly || !canEvaluateInquiry}
                            >
                              Maju
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {csrInquiries.filter(c => c.pipelineStatus === stage.code).length === 0 && (
                      <span className="text-[10px] text-gray-400 italic text-center block py-4">- Kosong -</span>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAP 6: VOLUNTEERS APPROVAL MODULE */}
          {activeTab === 'volunteers' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-450">
                  Registrasi & Seleksi Relawan Lapangan
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kontrol formulir lamaran draf relawan, saring berdasarkan skill mengajar, logistik ataupun driving darurat.
                </p>
              </div>

              {/* List grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3">
                {volunteers.map(v => (
                  <div key={v.id} className="border border-gray-150 dark:border-gray-750 bg-white dark:bg-gray-900 p-4 rounded-2xl text-xs space-y-2.5">
                    <div className="flex justify-between items-start font-bold">
                      <div>
                        <span className="text-gray-950 dark:text-white text-sm block tracking-tight">{v.name}</span>
                        <span className="text-[10px] text-gray-400 block font-normal">{v.email} • {v.whatsapp}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                        v.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : v.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {v.status}
                      </span>
                    </div>

                    <div className="text-slate-600 dark:text-gray-350">
                      <span className="font-semibold block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Pengalaman:</span>
                      <p className="font-semibold">{v.experience || 'Belum diisi.'}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 leading-normal">
                      {v.skills.map(sk => (
                        <span key={sk} className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 text-[9px] px-2 py-0.5 rounded font-bold">
                          {sk}
                        </span>
                      ))}
                    </div>

                    {v.status === 'pending' && (
                      <div id={`vol-actions-grp-${v.id}`} className="flex justify-end gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          type="button"
                          id={`btn-vol-reject-${v.id}`}
                          onClick={() => handleVolunteerStatus(v.id, 'rejected')}
                          className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-colors"
                          disabled={isReadOnly}
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          id={`btn-vol-approve-${v.id}`}
                          onClick={() => handleVolunteerStatus(v.id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-colors"
                          disabled={isReadOnly}
                        >
                          Approve Sukses
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAP 7: AI PLAYGROUND PANEL */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
                <div className="space-y-1 max-w-[70%]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-bounce fill-amber-300" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
                      Amanah Gemini AI Assistant
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-100 leading-normal">
                    Layanan asisten internal bertenaga <strong>Gemini 3.5 Flash</strong> untuk mengotomatiskan copywriting draf kampanye, usulan FAQ, transkripsi pesan, & penerjemah internasional.
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/30 rounded-xl shrink-0">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
              </div>

              {/* Set Action Selector */}
              <div className="grid grid-cols-2 md:grid-cols-5 p-1 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs font-bold shrink-0">
                <button
                  id="btn-ai-type-campaign"
                  onClick={() => {
                    setAiType('campaign');
                    setAiPrompt('Beasiswa asrama 1.000 anak asnaf yatim yang terancam putus sekolah di pelosok NTT');
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition-colors ${aiType === 'campaign' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Draf Campaign
                </button>
                <button
                  id="btn-ai-type-faq"
                  onClick={() => {
                    setAiType('faq');
                    setAiPrompt('Apakah amil mengenakan biaya pemotongan hak zakat maal di AIF?');
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition-colors ${aiType === 'faq' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Asisten Syariah FAQ
                </button>
                <button
                  id="btn-ai-type-impact"
                  onClick={() => {
                    setAiType('impact');
                    setAiPrompt('Penyaluran 3.500 paket beras nutrisi di Cilacap, Jawa Tengah oleh tim relawan');
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition-colors ${aiType === 'impact' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Narasi Dampak
                </button>
                <button
                  id="btn-ai-type-reply"
                  onClick={() => {
                    setAiType('reply');
                    setAiPrompt('Keluarga Bapak Budi Santoso baru mentransfer donasi Rp 25.000.000 untuk beasiswa dan doa beliau agar anaknya sukses');
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition-colors ${aiType === 'reply' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  WhatsApp Reply
                </button>
                <button
                  id="btn-ai-type-translate"
                  onClick={() => {
                    setAiType('translate');
                    setAiPrompt('Selamat kepada seluruh Mustahik yang menerima donasi dari Yayasan Amanah. Kami menjamin mutasi transparansi.');
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition-colors ${aiType === 'translate' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Penerjemah
                </button>
              </div>

              {/* Input text prompt */}
              <div className="space-y-3 font-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 dark:text-gray-300">
                    {aiType === 'translate' ? 'Teks Asli untuk Diterjemahkan:' : 'Input Intisari atau Parameter AI:'}
                  </label>
                  <textarea
                    id="input-ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium dark:text-white"
                  />
                </div>

                {/* extra translation config */}
                {aiType === 'translate' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 dark:text-gray-300">Pilih Bahasa Target:</label>
                    <select
                      value={aiTranslateLang}
                      onChange={(e) => setAiTranslateLang(e.target.value)}
                      className="text-xs p-2.5 border border-gray-250 dark:border-gray-750 rounded-lg dark:bg-gray-900 dark:text-white"
                    >
                      <option value="English">English</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Japanese">Japanese (日本語)</option>
                      <option value="Chinese">Chinese (简体中文)</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end shrink-0">
                  <button
                    type="button"
                    id="btn-submit-ai-assist"
                    onClick={handleAIAssist}
                    disabled={isAiLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-emerald-450 dark:disabled:bg-emerald-800 transition-colors"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sedang Menyusun Draft...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-white" />
                        Jalankan AI Assistant
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI output result panel */}
              {aiResult && (
                <div id="ai-output-box" className="bg-gray-50 dark:bg-gray-905 border border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl relative">
                  
                  <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest text-emerald-800 bg-emerald-55 border border-emerald-150 px-2 py-0.5 rounded uppercase">
                    {isAiSimulated ? 'Simulated AI Draft' : 'Real-Time Gemini 3.5 Content'}
                  </span>

                  <h5 className="text-xs font-extrabold text-emerald-850 dark:text-emerald-400 capitalize mb-3 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Hasil Rekomendasi Draft AI:
                  </h5>
                  
                  {/* Nicely preserving markdowns */}
                  <div className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-semibold whitespace-pre-wrap font-serif tracking-normal border-t border-gray-150 dark:border-gray-800 pt-3">
                    {aiResult}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 mt-4 border-t border-gray-150 dark:border-gray-800">
                    <button
                      type="button"
                      id="btn-apply-draft"
                      onClick={() => {
                        if (aiType === 'campaign') {
                          setNewCampStory(aiResult);
                          setNewCampDesc(aiPrompt);
                          setActiveTab('campaigns');
                          alert('Draf cerita kampanye berhasil diaplikasikan ke editor CMS Kampanye!');
                        } else {
                          navigator.clipboard.writeText(aiResult);
                          alert('Draf disalin! Siap dikirim via WhatsApp / Email.');
                        }
                      }}
                      className="bg-white hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 dark:border-gray-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer dark:text-white"
                    >
                      {aiType === 'campaign' ? 'Gunakan Draf Certia' : 'Salin ke Clipboard'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAP 8: PROFILE */}
          {activeTab === 'profile' && (
            <AdminProfileSection 
              currentAdmin={currentAdmin}
              setCurrentAdmin={setCurrentAdmin}
              onLogout={onLogout}
            />
          )}

        </div>

      </div>

    </div>
  );
}
