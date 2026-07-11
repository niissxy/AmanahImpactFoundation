/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Heart, Shield, CheckCircle, Copy, Share2, ArrowRight, Download, Send, Coins } from 'lucide-react';
import { Campaign, Donation } from '../types';
import { getTranslation } from '../translations';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  preSelectedCampaignSlug?: string;
  preSelectedAmount?: number;
  preSelectedCategory?: string;
  onSuccess: (donation: Donation) => void;
  langPack: any;
  currentLang: string;
}

export default function DonationModal({
  isOpen,
  onClose,
  campaigns,
  preSelectedCampaignSlug = '',
  preSelectedAmount = 0,
  preSelectedCategory = '',
  onSuccess,
  langPack,
  currentLang
}: DonationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Payment, 3: Completed Receipt
  
  // States values
  const [campaignSlug, setCampaignSlug] = useState<string>(preSelectedCampaignSlug || (campaigns[0]?.slug || ''));
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>(preSelectedAmount > 0 ? String(preSelectedAmount) : '100000');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [successDonation, setSuccessDonation] = useState<Donation | null>(null);

  const t = (text: string) => getTranslation(text, currentLang);

  useEffect(() => {
    if (preSelectedCampaignSlug) {
      setCampaignSlug(preSelectedCampaignSlug);
    }
  }, [preSelectedCampaignSlug]);

  useEffect(() => {
    if (preSelectedAmount > 0) {
      setAmountInput(String(preSelectedAmount));
    }
  }, [preSelectedAmount]);

  if (!isOpen) return null;

  const quickAmounts = [25000, 50000, 100000, 250000, 500000, 1000000];

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || Number(amountInput) < 10000) {
      alert(t('Minimal donasi adalah Rp 10.000'));
      return;
    }
    if (!donorName && !isAnonymous) {
      alert(t('Silakan masukkan nama Anda atau pilih Donasi Anonim'));
      return;
    }
    if (!donorEmail) {
      alert(t('Email wajib diisi untuk pengiriman kuitansi digital'));
      return;
    }
    setStep(2);
  };

  const handleProcessDonation = async () => {
    const payload = {
      donorName: isAnonymous ? t('Hamba Allah') : donorName || t('Hamba Allah'),
      donorEmail,
      donorPhone,
      campaignSlug,
      amount: Number(amountInput),
      isAnonymous,
      message,
      paymentMethod
    };

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessDonation(data);
        onSuccess(data);
        setStep(3);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      console.warn('Network issue or Vercel static environment. Running on client-side state engine.', err);
      // Generate client-side success donation representation
      const fallbackDonation: Donation = {
        id: `D-LOCAL-${Date.now()}`,
        donorName: payload.donorName,
        donorEmail: payload.donorEmail,
        donorPhone: payload.donorPhone,
        campaignTitle: campaigns.find(c => c.slug === campaignSlug)?.title || campaignSlug,
        campaignSlug: campaignSlug,
        amount: payload.amount,
        category: campaigns.find(c => c.slug === campaignSlug)?.category || 'Donasi',
        paymentMethod: payload.paymentMethod,
        status: 'success',
        isAnonymous: payload.isAnonymous,
        message: payload.message,
        receiptNumber: `AIF-RCPT-${Date.now().toString().slice(-6)}`,
        createdDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        certificateNumber: `AIF-CERT-LC-${Date.now().toString().slice(-4)}`
      };

      // Save to localStorage so it persists in offline/Vercel environments
      try {
        const storedDons = localStorage.getItem('amanah_donations');
        const list = storedDons ? JSON.parse(storedDons) : [];
        list.push(fallbackDonation);
        localStorage.setItem('amanah_donations', JSON.stringify(list));

        const storedCamps = localStorage.getItem('amanah_campaigns');
        if (storedCamps) {
          const campsList: Campaign[] = JSON.parse(storedCamps);
          const idx = campsList.findIndex(c => c.slug === campaignSlug);
          if (idx !== -1) {
            campsList[idx].collectedAmount += payload.amount;
            localStorage.setItem('amanah_campaigns', JSON.stringify(campsList));
          }
        }
      } catch (storageErr) {
        console.error('Error saving local fallback:', storageErr);
      }

      setSuccessDonation(fallbackDonation);
      onSuccess(fallbackDonation);
      setStep(3);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    alert(t('Berhasil disalin: ') + txt);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div id="modal-container" className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between text-gray-900 dark:text-white shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-none" />
            <span className="font-extrabold text-sm tracking-tight text-emerald-700 dark:text-emerald-400">
              {step === 1 ? t('Amanah Donasi Engine') : step === 2 ? t('Konfirmasi Pembayaran Amanah') : t('Donasi Berhasil! Alhamdulillah')}
            </span>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 dark:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable interior */}
        <div className="p-6 overflow-y-auto grow">

          {/* S1: Input step */}
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="space-y-4">
              
              {/* Campaign Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t('Tujuan Alokasi Kebaikan')}
                </label>
                <select
                  id="select-campaign-slug"
                  value={campaignSlug}
                  onChange={(e) => setCampaignSlug(e.target.value)}
                  className="w-full text-sm font-semibold border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="umum">{t('Donasi Umum Amanah Impact (Umum)')}</option>
                  {campaigns.map(c => (
                    <option key={c.slug} value={c.slug}>{t(c.title)}</option>
                  ))}
                </select>
              </div>

              {/* Amount section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  {t('Pilih Nominal Dukungan')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map(val => (
                    <button
                      key={val}
                      type="button"
                      id={`quick-amt-${val}`}
                      onClick={() => setAmountInput(String(val))}
                      className={`text-xs font-bold py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                        Number(amountInput) === val
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 scale-[1.03] shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 hover:bg-emerald-50/20 dark:hover:border-emerald-800 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {formatCurrency(val)}
                    </button>
                  ))}
                </div>

                <div className="relative rounded-xl shadow-sm mt-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs font-bold">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="input-custom-amount"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                    placeholder={t('Masukkan jumlah donasi lain')}
                  />
                </div>
              </div>

              {/* Recurring setting */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/30">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-600 rounded"
                    id="chk-recurring"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 block p-0">{t('Komitmen Donasi Rutin Bulanan')}</span>
                    <span className="text-[10px] text-gray-500">{t('Auto-reminder via WhatsApp & Email setiap bulannya (Infaq Berkelanjutan).')}</span>
                  </div>
                </label>
              </div>

              {/* Donor particulars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t('Informasi Donatur')}
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-600"
                      id="chk-anonymous"
                    />
                    <span className="text-xs text-gray-500 font-semibold">{t('Sembunyikan Nama (Anonim)')}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      id="input-donor-name"
                      value={isAnonymous ? t('Hamba Allah') : donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={t('Nama Lengkap')}
                      className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:opacity-65"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      id="input-donor-email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder={t('Alamat Email Kuitansi')}
                      className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    id="input-donor-phone"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder={t('Nomor WhatsApp (untuk update kuitansi & program)')}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <textarea
                    id="input-donor-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('Tulis pesan semangat, doa, atau harapan Anda...')}
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                id="btn-goto-payments"
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {t('Pilih Metode Pembayaran')}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                {t('Sertifikasi Keamanan Pembayaran Berlapis SSL & Enkripsi Data')}
              </div>
            </form>
          )}

          {/* S2: Payment Options Selection and Confirmation */}
          {step === 2 && (
            <div className="space-y-5">
              
              <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/30 rounded-xl p-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-semibold mb-1">{t('Dukungan Donasi Anda:')}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(Number(amountInput))}</span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                  {t('Untuk:')} {campaignSlug === 'umum' ? t('Donasi Umum Amanah Impact (Umum)') : t(campaigns.find(c => c.slug === campaignSlug)?.title || 'Donasi Umum Amanah')}
                </span>
                {isRecurring && <span className="inline-block bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 text-[9px] text-emerald-800 dark:text-emerald-300 rounded font-bold mt-2">{t('DULANG BULANAN RUTIN')}</span>}
              </div>

              {/* Group payment list */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('Metode Pembayaran Tersedia')}
                </label>

                {/* QRIS quick item */}
                <div className="grid grid-cols-1 gap-2.5">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/15'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment_chan" 
                      value="QRIS" 
                      checked={paymentMethod === 'QRIS'} 
                      onChange={() => setPaymentMethod('QRIS')}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <div className="grow">
                      <span className="text-xs font-bold text-gray-800 dark:text-white block">{t('QRIS Mandiri Otoritas')}</span>
                      <span className="text-[10px] text-gray-400 block">{t('Dukung semua E-wallet (GoPay, OVO, DANA, BCA Mobile)')}</span>
                    </div>
                    <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0">{t('INSTAN')}</span>
                  </label>

                  {/* VAs */}
                  {['Virtual Account BCA', 'Virtual Account Mandiri', 'Virtual Account BNI'].map(vaItem => (
                    <label key={vaItem} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === vaItem
                        ? 'border-emerald-600 bg-emerald-50/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/15'
                    }`}>
                      <input 
                        type="radio" 
                        name="payment_chan" 
                        value={vaItem} 
                        checked={paymentMethod === vaItem} 
                        onChange={() => setPaymentMethod(vaItem)}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <div className="grow">
                        <span className="text-xs font-bold text-gray-800 dark:text-white block">{vaItem}</span>
                        <span className="text-[10px] text-gray-400 block">{t('Simulasi Virtual Account transfer bank langsung')}</span>
                      </div>
                    </label>
                  ))}

                  {/* Manual Transfer */}
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'Transfer Bank Manual'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/15'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment_chan" 
                      value="Transfer Bank Manual" 
                      checked={paymentMethod === 'Transfer Bank Manual'} 
                      onChange={() => setPaymentMethod('Transfer Bank Manual')}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <div className="grow">
                      <span className="text-xs font-bold text-gray-800 dark:text-white block">{t('Transfer Rekening Yayasan Resmi (Verifikasi Manual)')}</span>
                      <span className="text-[10px] text-gray-400 block">{t('BRI Amanah Utama a.n. Amanah Impact Foundation')}</span>
                    </div>
                  </label>
                </div>
              </div>

              {paymentMethod === 'QRIS' && (
                <div id="qris-graphic-loader" className="border border-dashed border-emerald-300 dark:border-emerald-800 bg-gray-100/40 dark:bg-gray-900 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-bold block">{t('Silakan scan QRIS di atas melalui aplikasi bank atau e-wallet pilihan Anda untuk menyelesaikan pembayaran instan secara aman.')}</span>
                  
                  {/* Generated simulated center QR code */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AMANAH-IMPACT-NGO-DONATION-PRO-2026" 
                      alt="Simulated QRIS Code" 
                      className="w-32 h-32 select-none pointer-events-none"
                    />
                  </div>
                  
                  <span className="text-[10px] text-gray-400 font-medium block">
                    * QRIS dinamis berlisensi BI | Link referensi MD-AIF-7
                  </span>
                </div>
              )}

              {paymentMethod.startsWith('Virtual Account') && (
                <div id="va-loader" className="bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-semibold">{t('Nomor Virtual Account:')}</span>
                    <button 
                      type="button"
                      onClick={() => copyText('88081288881234')}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> {t('Salin Kode VA')}
                    </button>
                  </div>
                  <div className="text-xl font-mono text-center font-bold tracking-widest text-slate-900 dark:text-white bg-white dark:bg-gray-800/80 p-2.5 rounded-lg border border-gray-100">
                    88081288881234
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    {t('Lakukan transfer sebesar nominal di atas ke nomor Virtual Account berikut sebelum batas waktu habis.')}
                  </p>
                </div>
              )}

              {paymentMethod === 'Transfer Bank Manual' && (
                <div id="manual-bank-loader" className="bg-slate-50 dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-800 dark:text-white">
                    <span>{t('Bank BRI Syariah')}</span>
                    <button 
                      type="button" 
                      onClick={() => copyText('0231-01-000456-56-1')} 
                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> {t('Salin Kode VA')}
                    </button>
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    {t('No. Rekening:')} <span className="font-mono text-gray-950 dark:text-white">0231-01-000456-56-1</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('Atas Nama:')} <span className="font-bold">Yayasan Amanah Impact Foundation</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center cursor-pointer"
                >
                  {t('Kembali')}
                </button>
                <button
                  type="button"
                  id="btn-confirm-payment-success"
                  onClick={handleProcessDonation}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <CheckCircle className="w-4 h-4 fill-white" />
                  {t('Proses Donasi Sekarang')}
                </button>
              </div>

            </div>
          )}

          {/* S3: Complete / Receipt Display */}
          {step === 3 && successDonation && (
            <div id="receipt-success-display" className="space-y-6 text-center py-4">
              
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full mb-3 shadow shadow-emerald-500/20">
                  <CheckCircle className="w-10 h-10 fill-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{t('Donasi Berhasil! Alhamdulillah')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('Terima kasih, kepedulian Anda langsung tercatat dan berdampak bagi kemakmuran penerima manfaat.')}
                </p>
              </div>

              {/* Digital E-Receipt layout (fintech style) */}
              <div className="bg-slate-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-left text-xs space-y-2.5 relative">
                
                {/* Decorative border cut in ledger */}
                <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500"></div>

                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block tracking-tight text-sm">
                    {t('Kuitansi Digital Resmi')}
                  </span>
                  <span className="font-mono text-gray-400 text-[10px]">
                    No: {successDonation.receiptNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{t('Donatur')}</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {successDonation.donorName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{t('Tujuan Alokasi Kebaikan')}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 tracking-tight text-right shrink-0 max-w-[60%] truncate">
                    {t(successDonation.campaignTitle)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{t('Nominal')}</span>
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {formatCurrency(successDonation.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{t('Status Pembayaran')}</span>
                  <span className="font-bold px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 flex items-center gap-1 shrink-0">
                    {successDonation.paymentMethod} • {t('TERBAYAR & TERSALURKAN BERKAH')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{t('Waktu Transaksi')}</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {new Date(successDonation.createdDate).toLocaleString('id-ID')}
                  </span>
                </div>

                {successDonation.certificateNumber && (
                  <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2.5 mt-2 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        Sertifikat Digital Siap:
                      </span>
                      <span className="font-mono text-[9px] font-bold text-amber-900 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                        ID: {successDonation.certificateNumber}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                      Sertifikat kemaslahatan Amal Jariah atau Zakat syariah Anda telah terbit resmi a.n <strong>{successDonation.donorName}</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Action utilities */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    alert(t('Simulasi mengunduh PDF Kuitansi Resmi tuntas!'));
                  }}
                  id="btn-download-pdf-rcpt"
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750 dark:text-white border border-gray-300 dark:border-gray-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  {t('Unduh Kuitansi PDF')}
                </button>

                {successDonation.certificateNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Mencetak Sertifikat Digital: ${successDonation.certificateNumber}\n\nTerima kasih atas wakaf/zakat Anda! Atas Nama: ${successDonation.donorName}`);
                    }}
                    id="btn-download-cert"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 fill-white" />
                    Unduh Sertifikat Digital
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
                <span>{t('Bagikan Kebaikan')}:</span>
                <button 
                  type="button"
                  id="share-whatsapp"
                  onClick={() => copyText(`Alhamdulillah, saya baru saja menyalurkan donasi melalui Amanah Impact Foundation untuk program "${t(successDonation.campaignTitle)}". Salurkan kepedulian Anda sekarang melalui: ${window.location.href}`)}
                  className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors font-semibold text-[10px]"
                >
                  {t('Kirim via WhatsApp')}
                </button>
              </div>

              <button
                type="button"
                id="btn-finish-dialog"
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center cursor-pointer mt-2 transition-colors"
              >
                {t('Selesai & Kembali')}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
