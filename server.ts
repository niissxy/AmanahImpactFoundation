/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { 
  Campaign, Donation, Donor, Volunteer, CsrInquiry, Report, BlogPost, Testimonial, FAQ 
} from './src/types';

// Load environment variables
dotenv.config();

const __dirname = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI SDK initialized successfully on server-side.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI SDK:', error);
  }
} else {
  console.log('Gemini API key is not configured yet. Server will run with high-quality AI simulated drafts.');
}

// ---------------------------------------------------------
// SEED DATABASE (In-Memory Repository)
// ---------------------------------------------------------

const organization = {
  name: 'Amanah Impact Foundation',
  shortName: 'AIF',
  tagline: 'Transparan Berdampak, Amanah Menggerakkan Kebaikan',
  type: 'Yayasan Sosial, Zakat, Wakaf, dan Kemanusiaan',
  foundedYear: 2014,
  legalNumber: 'AHU-0012345.AH.01.04.Tahun 2014',
  taxNumber: '09.123.456.7-012.000',
  operationalLicense: 'SK Dinas Sosial No. 421/DS/2022',
  address: 'Jl. Kebaikan Raya No. 88, Jakarta Selatan, Indonesia',
  email: 'halo@amanahimpact.org',
  phone: '+62 21 8888 1234',
  whatsapp: '+62 812 8888 1234',
  website: 'https://amanahimpact.org',
  instagram: 'https://instagram.com/amanahimpact',
  tiktok: 'https://tiktok.com/@amanahimpact',
  youtube: 'https://youtube.com/@amanahimpact',
  facebook: 'https://facebook.com/amanahimpact'
};

const campaigns: Campaign[] = [
  {
    id: 'C-01',
    title: 'Beasiswa 1.000 Anak Yatim dan Dhuafa',
    slug: 'beasiswa-1000-anak-yatim-dhuafa',
    category: 'Pendidikan',
    status: 'active',
    isFeatured: true,
    isUrgent: false,
    targetAmount: 750000000,
    collectedAmount: 486500000,
    disbursedAmount: 325000000,
    beneficiaryTarget: 1000,
    beneficiaryReached: 642,
    location: 'Jakarta, Bogor, Depok, Tangerang, Bekasi',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    shortDescription: 'Bantu anak yatim dan dhuafa melanjutkan pendidikan melalui beasiswa bulanan, perlengkapan sekolah, dan mentoring.',
    story: 'Banyak anak yatim dan dhuafa memiliki semangat belajar tinggi, namun terkendala biaya sekolah, perlengkapan belajar, dan akses mentoring. Program ini membantu mereka tetap sekolah dan tumbuh percaya diri.',
    fundUsage: [
      { item: 'Beasiswa bulanan', amount: 450000000 },
      { item: 'Perlengkapan sekolah', amount: 175000000 },
      { item: 'Mentoring dan pembinaan', amount: 85000000 },
      { item: 'Operasional program', amount: 40000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'C-02',
    title: 'Wakaf Pembangunan Pesantren Tahfidz',
    slug: 'wakaf-pembangunan-pesantren-tahfidz',
    category: 'Wakaf',
    status: 'active',
    isFeatured: true,
    isUrgent: false,
    targetAmount: 2500000000,
    collectedAmount: 1287500000,
    disbursedAmount: 925000000,
    beneficiaryTarget: 500,
    beneficiaryReached: 180,
    location: 'Cianjur, Jawa Barat',
    startDate: '2025-08-01',
    endDate: '2026-11-30',
    shortDescription: 'Bangun pesantren tahfidz untuk santri yatim dan dhuafa dengan fasilitas asrama, kelas, masjid, dan dapur umum.',
    story: 'Pesantren ini dirancang menjadi pusat pendidikan Al-Qur\'an dan pemberdayaan santri dhuafa. Wakaf akan digunakan untuk pembangunan fisik dan fasilitas pembelajaran.',
    fundUsage: [
      { item: 'Pembangunan asrama santri', amount: 950000000 },
      { item: 'Ruang kelas', amount: 650000000 },
      { item: 'Masjid pesantren', amount: 600000000 },
      { item: 'Dapur dan fasilitas umum', amount: 300000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541829011853-89101397013e?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  },
  {
    id: 'C-03',
    title: 'Bantuan Pangan untuk 5.000 Keluarga Dhuafa',
    slug: 'bantuan-pangan-5000-keluarga-dhuafa',
    category: 'Pangan',
    status: 'active',
    isFeatured: true,
    isUrgent: true,
    targetAmount: 500000000,
    collectedAmount: 379250000,
    disbursedAmount: 310000000,
    beneficiaryTarget: 5000,
    beneficiaryReached: 3820,
    location: 'DKI Jakarta, Banten, Jawa Barat',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    shortDescription: 'Paket pangan berisi beras, minyak, telur, gula, dan kebutuhan pokok lainnya untuk keluarga dhuafa prasejahtera.',
    story: 'Kenaikan harga kebutuhan pokok membuat banyak keluarga rentan kesulitan memenuhi kebutuhan harian terkecil sekalipun. Program ini menyalurkan bantuan paket pangan darurat untuk keluarga miskin.',
    fundUsage: [
      { item: 'Paket sembako santri & dhuafa', amount: 425000000 },
      { item: 'Distribusi & Pengiriman', amount: 50000000 },
      { item: 'Dokumentasi dan laporan', amount: 25000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  },
  {
    id: 'C-04',
    title: 'Sumur Bersih untuk Desa Kekeringan',
    slug: 'sumur-bersih-desa-kekeringan',
    category: 'Air Bersih',
    status: 'active',
    isFeatured: false,
    isUrgent: true,
    targetAmount: 900000000,
    collectedAmount: 512000000,
    disbursedAmount: 380000000,
    beneficiaryTarget: 12000,
    beneficiaryReached: 6400,
    location: 'Gunungkidul, NTT, Lombok Timur',
    startDate: '2026-02-10',
    endDate: '2026-10-30',
    shortDescription: 'Bangun sumur bor dalam dan instalasi air bersih ramah lingkungan untuk desa yang mengalami kekeringan ekstrem.',
    story: 'Akses air bersih yang layak masih menjadi barang langka di beberapa wilayah terpencil Indonesia. Donasi digunakan untuk survei geolisterik, pengeboran sumur dalam, tangki air penampungan, dan instalasi perpipaan ke rumah warga.',
    fundUsage: [
      { item: 'Pengeboran sumur dalam', amount: 520000000 },
      { item: 'Tangki air dan pompa submersible', amount: 230000000 },
      { item: 'Instalasi pipa warga', amount: 110000000 },
      { item: 'Edukasi kebersihan & sanitasi', amount: 40000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541829011853-89101397013e?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  },
  {
    id: 'C-05',
    title: 'Bantuan Medis Darurat untuk Pasien Dhuafa',
    slug: 'bantuan-medis-darurat-pasien-dhuafa',
    category: 'Kesehatan',
    status: 'active',
    isFeatured: false,
    isUrgent: true,
    targetAmount: 650000000,
    collectedAmount: 245750000,
    disbursedAmount: 188000000,
    beneficiaryTarget: 300,
    beneficiaryReached: 91,
    location: 'Jabodetabek dan Jawa Barat',
    startDate: '2026-04-01',
    endDate: '2026-12-31',
    shortDescription: 'Bantuan biaya operasional pengobatan, pembelian obat non-BPJS, serta penyediaan fasilitas ambulans gratis bagi dhuafa.',
    story: 'Meskipun sebagian besar biaya rumah sakit dijamin, pasien miskin kerap kesulitan membeli vitamin khusus, alat bantu dengar/jalan, hingga ongkos transportasi harian untuk kemoterapi atau cuci darah rutin.',
    fundUsage: [
      { item: 'Bantuan obat khusus non-BPJS', amount: 420000000 },
      { item: 'Penyewaan alat kesehatan & ambulans', amount: 130000000 },
      { item: 'Transportasi & logistik harian pasien', amount: 70000000 },
      { item: 'Pendampingan kerelawanan medis', amount: 30000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  },
  {
    id: 'C-06',
    title: 'Tanam 100.000 Pohon untuk Masa Depan',
    slug: 'tanam-100000-pohon-untuk-masa-depan',
    category: 'Lingkungan',
    status: 'active',
    isFeatured: false,
    isUrgent: false,
    targetAmount: 1200000000,
    collectedAmount: 458000000,
    disbursedAmount: 210000000,
    beneficiaryTarget: 100000,
    beneficiaryReached: 28500,
    location: 'Jawa Barat, Jawa Tengah, Bali, Kalimantan Selatan',
    startDate: '2026-01-15',
    endDate: '2027-01-15',
    shortDescription: 'Reboisasi lahan kritis hutan kemasyarakatan dengan menanam bibit buah produktif, mangrove pesisir, serta pendampingan adopsi pohon.',
    story: 'Program peduli lingkungan ini berfokus pada keseimbangan iklim dan peningkatan ekonomi warga sekitar hutan dengan menanam bibit produktif serba guna.',
    fundUsage: [
      { item: 'Pembelian bibit pohon berkualitas', amount: 600000000 },
      { item: 'Biaya penanaman & reboisasi lapangan', amount: 300000000 },
      { item: 'Sistem tagging digital & monitoring', amount: 180000000 },
      { item: 'Sosialisasi & pembekalan petani lokal', amount: 120000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  },
  {
    id: 'C-07',
    title: 'Modal Usaha Mikro untuk Ibu Tangguh',
    slug: 'modal-usaha-mikro-ibu-tangguh',
    category: 'Pemberdayaan Ekonomi',
    status: 'active',
    isFeatured: false,
    isUrgent: false,
    targetAmount: 800000000,
    collectedAmount: 368500000,
    disbursedAmount: 240000000,
    beneficiaryTarget: 400,
    beneficiaryReached: 135,
    location: 'Bandung, Garut, Tasikmalaya',
    startDate: '2026-02-01',
    endDate: '2026-12-31',
    shortDescription: 'Pemberian dana modal usaha bergulir tanpa bunga (qardhul hasan), workshop pembukuan keuangan, serta pendampingan branding digital.',
    story: 'Banyak ibu-ibu pengusaha makanan ringan atau warung klontong terpapar pinjaman online atau rentenir karena keterbatasan modal usaha. Kami membantu menghadirkan modal berkah dan pembekalan bisnis.',
    fundUsage: [
      { item: 'Penyaluran modal usaha mandiri', amount: 560000000 },
      { item: 'Workshop & modul pembukuan gratis', amount: 120000000 },
      { item: 'Pendampingan kemasan & branding digital', amount: 90000000 },
      { item: 'Evaluasi berkala & monitoring', amount: 30000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  },
  {
    id: 'C-08',
    title: 'Zakat Maal untuk Mustahik Produktif',
    slug: 'zakat-maal-mustahik-produktif',
    category: 'Zakat',
    status: 'active',
    isFeatured: true,
    isUrgent: false,
    targetAmount: 1000000000,
    collectedAmount: 632000000,
    disbursedAmount: 475000000,
    beneficiaryTarget: 800,
    beneficiaryReached: 520,
    location: 'Indonesia',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    shortDescription: 'Salurkan zakat maal Anda untuk program mustahik transformatif agar mereka mampu berdaya dan mandiri secara ekonomi.',
    story: 'Dana zakat disalurkan dengan pola asasi syariah 8 asnaf, diprioritaskan bagi program beasiswa vokasi, jaminan nutrisi lansia sebatang kara, serta pendayagunaan zakat produktif bagi mustahik.',
    fundUsage: [
      { item: 'Bantuan santunan langsung fakir miskin', amount: 520000000 },
      { item: 'Penyaluran dana modal kerja produktif', amount: 300000000 },
      { item: 'Beasiswa pendidikan yatim & asnaf', amount: 120000000 },
      { item: 'Hak Amil (pengelolaan zakat)', amount: 60000000 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200',
    videoUrl: ''
  }
];

const donations: Donation[] = [
  {
    id: 'D-0001',
    donorName: 'Budi Santoso',
    donorEmail: 'budi.santoso@example.com',
    donorPhone: '+6281211110001',
    campaignTitle: 'Beasiswa 1.000 Anak Yatim dan Dhuafa',
    campaignSlug: 'beasiswa-1000-anak-yatim-dhuafa',
    amount: 25000000,
    category: 'Pendidikan',
    paymentMethod: 'Virtual Account BCA',
    status: 'success',
    isAnonymous: false,
    message: 'Semoga anak-anak Indonesia bisa terus sekolah dan meraih masa depan emas.',
    receiptNumber: 'AIF-RCPT-2026-000001',
    createdDate: '2026-05-18T10:00:00Z',
    paidDate: '2026-05-18T10:05:00Z',
    certificateNumber: 'AIF-CERT-ED-0001'
  },
  {
    id: 'D-0002',
    donorName: 'Aisyah Putri',
    donorEmail: 'aisyah.putri@example.com',
    donorPhone: '+6281211110002',
    campaignTitle: 'Zakat Maal untuk Mustahik Produktif',
    campaignSlug: 'zakat-maal-mustahik-produktif',
    amount: 5500000,
    category: 'Zakat',
    paymentMethod: 'QRIS',
    status: 'success',
    isAnonymous: false,
    message: 'Zakat maal tunai pribadi. Mohon disalurkan kepada mereka yang benar-benar mustahik sesuai asnaf.',
    receiptNumber: 'AIF-RCPT-2026-000002',
    createdDate: '2026-05-20T14:30:00Z',
    paidDate: '2026-05-20T14:31:00Z',
    certificateNumber: 'AIF-CERT-ZK-0002'
  },
  {
    id: 'D-0003',
    donorName: 'PT Surya Digital Nusantara',
    donorEmail: 'csr@suryadigital.co.id',
    donorPhone: '+6281211110003',
    campaignTitle: 'Tanam 100.000 Pohon untuk Masa Depan',
    campaignSlug: 'tanam-100000-pohon-untuk-masa-depan',
    amount: 250000000,
    category: 'CSR',
    paymentMethod: 'Corporate Transfer',
    status: 'success',
    isAnonymous: false,
    message: 'Sumbangan CSR Resmi Perusahaan untuk Program Penghijauan Lingkungan Pesisir Jawa Barat.',
    receiptNumber: 'AIF-RCPT-2026-000003',
    createdDate: '2026-05-22T09:00:00Z',
    paidDate: '2026-05-22T11:00:00Z',
    certificateNumber: 'AIF-CERT-CSR-0003'
  },
  {
    id: 'D-0004',
    donorName: 'Hamba Allah',
    donorEmail: 'anonymous001@example.com',
    donorPhone: '+6281211110004',
    campaignTitle: 'Wakaf Pembangunan Pesantren Tahfidz',
    campaignSlug: 'wakaf-pembangunan-pesantren-tahfidz',
    amount: 10000000,
    category: 'Wakaf',
    paymentMethod: 'GoPay',
    status: 'success',
    isAnonymous: true,
    message: 'Wakaf jariah diniatkan penuh atas nama kedua orang tua kandung kami tercinta.',
    receiptNumber: 'AIF-RCPT-2026-000004',
    createdDate: '2026-05-23T19:40:00Z',
    paidDate: '2026-05-23T19:41:00Z',
    certificateNumber: 'AIF-CERT-WK-0004'
  },
  {
    id: 'D-0005',
    donorName: 'Yayasan Keluarga Harmoni',
    donorEmail: 'keluargaharmoni@example.org',
    donorPhone: '+6281211110005',
    campaignTitle: 'Bantuan Pangan untuk 5.000 Keluarga Dhuafa',
    campaignSlug: 'bantuan-pangan-5000-keluarga-dhuafa',
    amount: 35000000,
    category: 'Pangan',
    paymentMethod: 'Virtual Account Mandiri',
    status: 'success',
    isAnonymous: false,
    message: 'Semoga menjadi amalan berkah dan membantu keringanan logistik keluarga dhuafa.',
    receiptNumber: 'AIF-RCPT-2026-000005',
    createdDate: '2026-05-25T08:15:00Z',
    paidDate: '2026-05-25T08:18:00Z',
    certificateNumber: 'AIF-CERT-PG-0005'
  }
];

// Generate extra simulated donations for high-fidelity interactive feeling
const manualPaymentMethods = ['QRIS', 'Virtual Account BCA', 'Virtual Account Mandiri', 'Virtual Account BRI', 'OVO', 'DANA', 'GoPay', 'LinkAja', 'Transfer Bank Manual'];
const namesSeed = ['Dimas Setiawan', 'Laras Sati', 'Yusuf Habibi', 'Kartika S', 'Andi Pratama', 'Siti Rahayu', 'Hendra Wijaya', 'Hamba Allah', 'Fitri Handayani', 'Rudi Tabuti'];
const messagesSeed = [
  'Semoga berkah untuk sesama.',
  'Bismillah, mohon disalurkan untuk kepentingan program.',
  'Sedekit sumbangan yang semoga meringankan beban mereka.',
  'Amanah penyaluran sangat kami percaya di AIF.',
  'Wakaf jariah keluarga.',
  'Sukses selalu beasiswa masa depan anak bangsa.',
  'Semoga lekas meluas dan terealisasi penuh pembangunannya.',
  ''
];

// Instantly push 20 additional items to expand data metrics and visual graphs
for (let i = 1; i <= 25; i++) {
  const isAnon = Math.random() > 0.7;
  const donorName = isAnon ? 'Hamba Allah' : namesSeed[Math.floor(Math.random() * namesSeed.length)];
  const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];
  const randomAmount = [25000, 50000, 100000, 250000, 500000, 1000000, 2500000][Math.floor(Math.random() * 7)];
  const randMethod = manualPaymentMethods[Math.floor(Math.random() * manualPaymentMethods.length)];
  const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  donations.push({
    id: `D-EXTRA-${i}`,
    donorName,
    donorEmail: `${donorName.toLowerCase().replace(/\s/g, '') || 'anon'}@example.com`,
    donorPhone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
    campaignTitle: randomCampaign.title,
    campaignSlug: randomCampaign.slug,
    amount: randomAmount,
    category: randomCampaign.category,
    paymentMethod: randMethod,
    status: Math.random() > 0.15 ? 'success' : 'pending',
    isAnonymous: isAnon,
    message: messagesSeed[Math.floor(Math.random() * messagesSeed.length)],
    receiptNumber: `AIF-RCPT-2026-X${String(i).padStart(4, '0')}`,
    createdDate: `2026-05-${randomDay}T09:20:00Z`,
    paidDate: `2026-05-${randomDay}T09:25:00Z`
  });
}

// Set initial summaries of campaign values reflecting generated transactions
campaigns.forEach(c => {
  const sum = donations
    .filter(d => d.campaignSlug === c.slug && d.status === 'success')
    .reduce((curr, d) => curr + d.amount, 0);
  if (sum > 0) {
    c.collectedAmount = sum;
  }
});

const donors: Donor[] = [
  { id: 'DN-01', name: 'Budi Santoso', email: 'budi.santoso@example.com', whatsapp: '+6281211110001', city: 'Jakarta Selatan', province: 'DKI Jakarta', type: 'Individual', segment: 'VIP Donor', totalDonation: 125000000, donationCount: 18, isRecurring: true, isVIP: true, tags: ['Donatur Sembako', 'Pendidikan'], followUpStatus: 'Sudah di-WA', notes: 'Sangat peduli beasiswa anak dhuafa.' },
  { id: 'DN-02', name: 'Aisyah Putri', email: 'aisyah.putri@example.com', whatsapp: '+6281211110002', city: 'Bandung', province: 'Jawa Barat', type: 'Individual', segment: 'Regular Donor', totalDonation: 18500000, donationCount: 12, isRecurring: true, isVIP: false, tags: ['Zakat Maal'], followUpStatus: 'Sudah di-WA', notes: 'Rutin membayar zakat tabungan tahunan.' },
  { id: 'DN-03', name: 'PT Surya Digital Nusantara', email: 'csr@suryadigital.co.id', whatsapp: '+6281211110003', city: 'Jakarta Pusat', province: 'DKI Jakarta', type: 'Corporate', segment: 'CSR Donor', totalDonation: 350000000, donationCount: 4, isRecurring: false, isVIP: true, tags: ['CSR Partner', 'Lingkungan'], followUpStatus: 'Meeting Terjadwal', notes: 'Tertarik memperpanjang program reboisasi pesisir.' },
  { id: 'DN-04', name: 'Yayasan Keluarga Harmoni', email: 'keluargaharmoni@example.org', whatsapp: '+6281211110005', city: 'Tangerang Selatan', province: 'Banten', type: 'Community', segment: 'Community Donor', totalDonation: 68000000, donationCount: 7, isRecurring: false, isVIP: true, tags: ['Sponsor Komunitas', 'Wakaf'], followUpStatus: 'Terkirim Proposal', notes: 'Komunitas donatur keluarga terdidik.' }
];

const campaignUpdates = [
  { id: 'U-01', campaignSlug: 'beasiswa-1000-anak-yatim-dhuafa', title: '642 Anak Telah Menerima Bantuan Beasiswa', date: '2026-05-20', description: 'Alhamdulillah, bantuan beasiswa tahap kedua telah sukses disalurkan kepada 642 anak asnaf dan dhuafa di wilayah Jabodetabek. Penerima menerima dana bantuan tuntas, paket tas sekolah, dan buku pelajaran.', mediaType: 'image', imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600', visibility: 'public' },
  { id: 'U-02', campaignSlug: 'wakaf-pembangunan-pesantren-tahfidz', title: 'Proses Pembangunan Asrama Mencapai 55%', date: '2026-05-12', description: 'Proses pembangunan fisik asrama santri tahfidz di Cianjur kini telah memasuki perakitan konstruksi atap baja ringan dan pemasangan instalasi listrik interior.', mediaType: 'video', visibility: 'public' },
  { id: 'U-03', campaignSlug: 'sumur-bersih-desa-kekeringan', title: '3 Titik Sumur Bor Baru Siap Pakai di NTT', date: '2026-04-30', description: 'Tiga titik sumur bor dalam di wilayah Lombok Timur dan NTT kini sudah rampung dipasangi pipa dan motor penggerak submersible bertenaga surya. Air mengalir lancar.', mediaType: 'image', imageUrl: 'https://images.unsplash.com/photo-1541829011853-89101397013e?auto=format&fit=crop&q=80&w=600', visibility: 'public' }
];

const beneficiaries = [
  { id: 'B-01', name: 'Kelompok Anak Binaan Jakarta Selatan', type: 'Group', category: 'Anak Yatim/Pendidikan', totalPeople: 180, location: 'Cilandak, Jakarta Selatan', campaign: 'Beasiswa 1.000 Anak Yatim dan Dhuafa', status: 'active' },
  { id: 'B-02', name: 'Santri Tahfidz Cianjur Angkatan 2026', type: 'Group', category: 'Santri/Wakaf', totalPeople: 120, location: 'Cianjur', campaign: 'Wakaf Pembangunan Pesantren Tahfidz', status: 'active' },
  { id: 'B-03', name: 'Warga Desa Sumber Makmur', type: 'Community', category: 'Air Bersih', totalPeople: 2400, location: 'Lombok Timur', campaign: 'Sumur Bersih untuk Desa Kekeringan', status: 'active' }
];

const volunteers: Volunteer[] = [
  { id: 'V-01', name: 'Rina Oktaviani', email: 'rina.volunteer@example.com', whatsapp: '+6281311110001', city: 'Jakarta Timur', skills: ['Event Management', 'Dokumentasi', 'Mengajar'], interestArea: ['Pendidikan', 'Anak Yatim'], availability: 'Weekend', experience: 'Mengajar relawan di pelosok Maluku 1 tahun.', status: 'approved', registeredDate: '2026-05-01' },
  { id: 'V-02', name: 'Dimas Prakoso', email: 'dimas.volunteer@example.com', whatsapp: '+6281311110002', city: 'Bandung', skills: ['Logistik', 'Driving', 'Distribusi'], interestArea: ['Bencana', 'Pangan'], availability: 'Flexible', experience: 'Bantuan evakuasi bencana gempa Cianjur.', status: 'pending', registeredDate: '2026-05-15' },
  { id: 'V-03', name: 'Nurul Azizah', email: 'nurul.volunteer@example.com', whatsapp: '+6281311110003', city: 'Depok', skills: ['Desain Grafis', 'Social Media', 'Copywriting'], interestArea: ['Lingkungan', 'CSR'], availability: 'Weekday Evening', experience: 'Mendesain feed Instagram LSM Hijau.', status: 'approved', registeredDate: '2026-05-10' }
];

const csrInquiries: CsrInquiry[] = [
  { id: 'CSR-01', companyName: 'PT Surya Digital Nusantara', picName: 'Michael Tan', position: 'Head of CSR', email: 'michael.tan@suryadigital.co.id', whatsapp: '+6281411110001', website: 'https://suryadigital.co.id', budgetRange: 'Rp250.000.000 - Rp500.000.000', interestedProgram: 'Lingkungan', locationTarget: 'Jawa Barat pesisir', message: 'Kami ingin mendongkrak inisiasi program reboisasi 100.000 pohon untuk wilayah rawan abrasi.', pipelineStatus: 'deal_won', createdDate: '2026-05-05' },
  { id: 'CSR-02', companyName: 'PT Harmoni Sehat Indonesia', picName: 'dr. Laura Amanda', position: 'Corporate Affairs Manager', email: 'laura@harmonisehat.co.id', whatsapp: '+6281411110002', website: 'https://harmonisehat.co.id', budgetRange: 'Rp100.000.000 - Rp250.000.000', interestedProgram: 'Kesehatan', locationTarget: 'Jabodetabek', pipelineStatus: 'proposal_sent', createdDate: '2026-05-12' },
  { id: 'CSR-03', companyName: 'Bank Amanah Syariah', picName: 'Rizky Ramadhan', position: 'CSR Partnership Lead', email: 'rizky@bankamanah.co.id', whatsapp: '+6281411110003', website: 'https://bankamanah.co.id', budgetRange: 'Rp500.000.000 - Rp1.000.000.000', interestedProgram: 'Zakat dan Wakaf', locationTarget: 'Nasional', pipelineStatus: 'meeting_scheduled', createdDate: '2026-05-20' }
];

const reports: Report[] = [
  { id: 'RP-01', title: 'Laporan Penyaluran Beasiswa Tahap 2', campaignSlug: 'beasiswa-1000-anak-yatim-dhuafa', type: 'Monthly Report', period: 'Mei 2026', totalReceived: 486500000, totalDisbursed: 325000000, remainingBalance: 161500000, publicVisibility: true, auditStatus: 'reviewed', description: 'Laporan rinci amil dan pendistribusian dana beasiswa bagi 642 anak asnaf dan dhuafa di wilayah Jabodetabek terbukti tuntas.', publishedDate: '2026-05-20' },
  { id: 'RP-02', title: 'Laporan Progress Wakaf Pesantren', campaignSlug: 'wakaf-pembangunan-pesantren-tahfidz', type: 'Progress Report', period: 'Mei 2026', totalReceived: 1287500000, totalDisbursed: 925000000, remainingBalance: 362500000, publicVisibility: true, auditStatus: 'reviewed', description: 'Update komprehensif audit fisik pembangunan asrama (55%), kelas baru (40%), dan masjid pesantren (35%).', publishedDate: '2026-05-15' },
  { id: 'RP-03', title: 'Laporan Bantuan Pangan Ramadan', campaignSlug: 'bantuan-pangan-5000-keluarga-dhuafa', type: 'Distribution Report', period: 'April 2026', totalReceived: 379250000, totalDisbursed: 310000000, remainingBalance: 69250000, publicVisibility: true, auditStatus: 'published', description: 'Laporan lengkap aksi pangan kemanusiaan sebar sapa sembako ramadan tersalurkan untuk 3.820 penerima.', publishedDate: '2026-04-20' }
];

const blogs: BlogPost[] = [
  {
    id: 'B-01',
    title: 'Mengapa Transparansi Donasi Penting untuk Yayasan Modern',
    slug: 'mengapa-transparansi-donasi-penting',
    category: 'Transparansi',
    author: 'Salsabila Putri',
    status: 'published',
    excerpt: 'Kepercayaan publik dibangun dari laporan yang jelas, dokumentasi nyata di lapangan, serta audit transparansi keuangan yang konsisten.',
    content: 'Di era digital yang serba cepat ini, trust (kepercayaan) menjadi mata uang terpenting bagi sebuah lembaga nirlaba atau NGO kemanusiaan. Transparansi bukan lagi sekadar kewajiban pelaporan administratif kepada dewan pembina, melainkan sebuah bentuk pertanggungjawaban sosial yang mutlak kepada publik luas.\n\nDengan sistem pencoretan dana digital atau real-time public ledger, donatur bisa secara presisi melihat kemana mengalirnya rupiah yang mereka percayakan. Hal ini memperkuat hubungan batin donatur, meyakinkan bahwa bantuan telah sampai tuntas pada yang paling berpendidikan dan paling membutuhkan secara profesional.',
    language: 'id',
    publishedDate: '2026-05-10',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'B-02',
    title: 'Panduan Menghitung Zakat Penghasilan Lengkap',
    slug: 'panduan-menghitung-zakat-penghasilan-lengkap',
    category: 'Zakat',
    author: 'Ahmad Zaini',
    status: 'published',
    excerpt: 'Pelajari secara mudah cara menghitung zakat penghasilan, nisab nisbah bulanan dan tahunan, serta dalil amil syariah.',
    content: 'Zakat penghasilan (zakat profesi) adalah bagian dari zakat mal yang wajib dikeluarkan atas harta yang diperoleh dari hasil profesi atau pekerjaan/pendapatan halal.\n\nCara menghitungnya sangat sederhana: Jika pendapatan bulanan bersih Anda melebihi batas nisab emas (sekitar setara 85 gram emas per tahun, atau kurang lebih Rp85.000.000 pertahun alias Rp7.000.000 per bulan), maka wajib mengeluarkan zakat pendapatan sebesar 2,5%. Menggunakan Zakat Calculator di AIF, Anda tinggal memasukkan nominal pendapatan kotor maupun bersih beserta pemotongan utang jatuh tempo, untuk langsung berzakat tuntas seketika kian berkah.',
    language: 'id',
    publishedDate: '2026-05-15',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'B-03',
    title: 'How CSR Programs Can Create Measurable Social Impact',
    slug: 'csr-programs-measurable-social-impact',
    category: 'CSR',
    author: 'Rendy Saputra',
    status: 'published',
    excerpt: 'Corporate social responsibility becomes stronger and more meaningful when driven by data, local community ownership, and measurable outcomes.',
    content: 'Modern corporations are no longer assessed solely on quarterly profits or stock values. The rise of ESG (Environmental, Social, and Governance) principles means that corporate social responsibility is fully under the microscope.\n\nTo make a CSR campaign truly successful, it must pivot from traditional cash handouts to sustainable, measurable development plans, such as providing solar water wells, backing formal tahfidz boarding schools, or vocational educational grants that yield long-term livelihood security. Dynamic dashboards provided by Amanah Impact Foundation help partners download live data points and field photos suitable for corporate reports.',
    language: 'en',
    publishedDate: '2026-05-18',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
  }
];

const testimonials: Testimonial[] = [
  { 
    id: 'T-01', 
    name: 'Siti Aminah', 
    role: 'Orang Tua Penerima Beasiswa', 
    content: 'Bantuan beasiswa bulanan AIF membuat anak saya bisa tetap sekolah dan membeli perlengkapan sekolah dasar tuntas tanpa cemas.', 
    message: 'Bantuan beasiswa bulanan AIF membuat anak saya bisa tetap sekolah dan membeli perlengkapan sekolah dasar tuntas tanpa cemas.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
    location: 'Sukabumi',
    rating: 5, 
    type: 'beneficiary' 
  },
  { 
    id: 'T-04', 
    name: 'Ustadz Ahmad Fauzi', 
    role: 'Penerima Manfaat Sumur Bor', 
    content: 'Alhamdulillah, sumur bor dari Amanah Impact Foundation mengalirkan air bersih yang sangat melimpah untuk wudhu 300 santri pesantren kami di Cilacap.', 
    message: 'Alhamdulillah, sumur bor dari Amanah Impact Foundation mengalirkan air bersih yang sangat melimpah untuk wudhu 300 santri pesantren kami di Cilacap.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    location: 'Cilacap',
    rating: 5, 
    type: 'beneficiary' 
  },
  { 
    id: 'T-02', 
    name: 'Budi Santoso', 
    role: 'Donatur Rutin', 
    content: 'Amanah Impact Foundation luar biasa transparan. Setiap bulan saya mendapatkan PDF laporan penyaluran yang didokumentasikan mendetail!', 
    message: 'Amanah Impact Foundation luar biasa transparan. Setiap bulan saya mendapatkan PDF laporan penyaluran yang didokumentasikan mendetail!',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
    location: 'Jakarta',
    rating: 5, 
    type: 'donor' 
  },
  { 
    id: 'T-03', 
    name: 'Michael Tan', 
    role: 'Head of CSR PT Surya Digital', 
    content: 'Sistem monitoring CSR AIF dan peta distribusinya sangat membantu penyusunan laporan tahunan ESG korporasi kami secara presisi.', 
    message: 'Sistem monitoring CSR AIF dan peta distribusinya sangat membantu penyusunan laporan tahunan ESG korporasi kami secara presisi.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
    location: 'Surabaya',
    rating: 5, 
    type: 'csr_partner' 
  }
];

const faqs: FAQ[] = [
  { id: 'F-01', category: 'Donasi', question: 'Apakah donasi saya akan mendapatkan bukti pembayaran resmi?', answer: 'Ya, sistem kami secara otomatis memproses dan men-generate Receipt resmi atau Bukti Penerimaan Donasi Elektronik lengkap dengan tanda tangan digital dan nomor transaksi unik sesaat setelah donasi terverifikasi sukses.' },
  { id: 'F-02', category: 'Zakat', question: 'Berapa standard nisab zakat profesi bulanan yang berlaku saat ini?', answer: 'Nisab zakat profesi bulanan merujuk pada ketetapan Baznas, yakni setara nilai harga 653 kg gabah kering atau setara 85 gram emas per tahun (sekitar Rp6.800.000 hingga Rp7.500.000 per bulan tergantung fluktuasi harga emas).' },
  { id: 'F-03', category: 'Wakaf', question: 'Apakah wakaf tunai mendapatkan sertifikat digital resmi?', answer: 'Ya, donatur yang menyalurkan wakaf uang di Amanah Impact Foundation berhak mengunduh Sertifikat Wakaf Digital (Digital Wakaf Pledge) berisi data nama pewakaf, ikrar wakaf, peruntukan aset, dan tanda tangan resmi nadzir.' }
];

// ---------------------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------------------

// Organization Data
app.get('/api/organization', (req, res) => {
  res.json(organization);
});

// Campaigns Endpoints
app.get('/api/campaigns', (req, res) => {
  res.json(campaigns);
});

app.get('/api/campaigns/:slug', (req, res) => {
  const campaign = campaigns.find(c => c.slug === req.params.slug);
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  const updates = campaignUpdates.filter(u => u.campaignSlug === campaign.slug);
  res.json({ campaign, updates });
});

// Admin creates campaign
app.post('/api/campaigns', (req, res) => {
  const { title, category, targetAmount, shortDescription, story, fundUsage, isUrgent, isFeatured, location } = req.body;
  
  if (!title || !category || !targetAmount) {
    return res.status(400).json({ message: 'Title, category, and target targetAmount are required.' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCampaign = {
    id: `C-${String(campaigns.length + 1).padStart(2, '0')}`,
    title,
    slug,
    category,
    status: 'active' as const,
    isFeatured: !!isFeatured,
    isUrgent: !!isUrgent,
    targetAmount: Number(targetAmount),
    collectedAmount: 0,
    disbursedAmount: 0,
    beneficiaryTarget: 250,
    beneficiaryReached: 0,
    location: location || 'Nasional',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    shortDescription: shortDescription || title,
    story: story || `${title} adalah upaya gotong-royong demi meredam kesenjangan sosial masyarakat dhuafa.`,
    fundUsage: fundUsage || [{ item: 'Operasional Lapangan', amount: Number(targetAmount) }],
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200'
  };

  campaigns.push(newCampaign);
  res.status(201).json(newCampaign);
});

// Add updates
app.post('/api/campaigns/:slug/updates', (req, res) => {
  const { title, description, mediaType, imageUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  const newUpdate = {
    id: `U-${String(campaignUpdates.length + 1).padStart(2, '0')}`,
    campaignSlug: req.params.slug,
    title,
    date: new Date().toISOString().split('T')[0],
    description,
    mediaType: mediaType || 'image',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
    visibility: 'public' as const
  };

  campaignUpdates.push(newUpdate);
  res.status(201).json(newUpdate);
});

// Donations Endpoints
app.get('/api/donations', (req, res) => {
  res.json(donations);
});

// Submit a new donation (Engine Simulation)
app.post('/api/donations', (req, res) => {
  const { donorName, donorEmail, donorPhone, campaignSlug, amount, isAnonymous, message, paymentMethod } = req.body;
  
  if (!donorName || !donorEmail || !amount || !campaignSlug) {
    return res.status(400).json({ message: 'Required fields missing: name, email, magnitude, and program.' });
  }

  const matchedCampaign = campaigns.find(c => c.slug === campaignSlug);
  const campaignName = matchedCampaign ? matchedCampaign.title : 'Donasi Umum Amanah';
  const category = matchedCampaign ? matchedCampaign.category : 'Umum';

  const transactionId = `D-${String(donations.length + 1).padStart(4, '0')}`;
  const receiptNum = `AIF-RCPT-2026-${String(donations.length + 1).padStart(6, '0')}`;
  const certificateNumber = (category === 'Wakaf' || category === 'Zakat') 
    ? `AIF-CERT-${category === 'Wakaf' ? 'WK' : 'ZK'}-${String(donations.length + 1).padStart(4, '0')}`
    : `AIF-CERT-GEN-${String(donations.length + 1).padStart(4, '0')}`;

  const defaultStatus = 'success'; // Automatically clear in simulation to avoid user waiting friction!

  const newDonation = {
    id: transactionId,
    donorName: isAnonymous ? 'Hamba Allah' : donorName,
    donorEmail,
    donorPhone: donorPhone || '',
    campaignTitle: campaignName,
    campaignSlug,
    amount: Number(amount),
    category,
    paymentMethod: paymentMethod || 'QRIS',
    status: 'success' as const,
    isAnonymous: !!isAnonymous,
    message: message || '',
    receiptNumber: receiptNum,
    createdDate: new Date().toISOString(),
    paidDate: new Date().toISOString(),
    certificateNumber
  };

  donations.push(newDonation);

  // Safely trigger updating campaign collectedAmount metric & donor records
  if (matchedCampaign) {
    matchedCampaign.collectedAmount += Number(amount);
    matchedCampaign.beneficiaryReached = Math.min(matchedCampaign.beneficiaryTarget, matchedCampaign.beneficiaryReached + 1);
  }

  // Update CRM logs
  const existingDonorIndex = donors.findIndex(dn => dn.email.toLowerCase() === donorEmail.toLowerCase());
  if (existingDonorIndex > -1) {
    donors[existingDonorIndex].totalDonation += Number(amount);
    donors[existingDonorIndex].donationCount += 1;
    if (Number(amount) >= 5000000) {
      donors[existingDonorIndex].segment = 'VIP Donor';
      donors[existingDonorIndex].isVIP = true;
    }
  } else {
    donors.push({
      id: `DN-${String(donors.length + 1).padStart(2, '0')}`,
      name: isAnonymous ? 'Hamba Allah' : donorName,
      email: donorEmail,
      whatsapp: donorPhone || '+628120000000',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      type: 'Individual' as const,
      segment: Number(amount) >= 5000000 ? 'VIP Donor' : 'Regular Donor',
      totalDonation: Number(amount),
      donationCount: 1,
      isRecurring: false,
      isVIP: Number(amount) >= 5000000,
      tags: [category],
      followUpStatus: 'Baru',
      notes: 'Terdaftar otomatis dari formulir donasi online.'
    });
  }

  res.status(201).json(newDonation);
});

// Admin verify / change transaction status (Finance / Review tool)
app.post('/api/donations/:id/verify', (req, res) => {
  const matched = donations.find(d => d.id === req.params.id);
  if (!matched) {
    return res.status(404).json({ message: 'Donation not found' });
  }

  const { status } = req.body;
  if (!['success', 'pending', 'failed', 'refunded'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status requested' });
  }

  const originalStatus = matched.status;
  matched.status = status as any;
  if (status === 'success' && originalStatus !== 'success') {
    matched.paidDate = new Date().toISOString();
    
    // Add amount calculation
    const comp = campaigns.find(c => c.slug === matched.campaignSlug);
    if (comp) {
      comp.collectedAmount += matched.amount;
    }
  } else if (status !== 'success' && originalStatus === 'success') {
    const comp = campaigns.find(c => c.slug === matched.campaignSlug);
    if (comp) {
      comp.collectedAmount = Math.max(0, comp.collectedAmount - matched.amount);
    }
  }

  res.json({ message: 'Verification successful', donation: matched });
});

// Donors Endpoints
app.get('/api/donors', (req, res) => {
  res.json(donors);
});

app.post('/api/donors/:id/note', (req, res) => {
  const matched = donors.find(d => d.id === req.params.id);
  if (!matched) {
    return res.status(404).json({ message: 'Donor not found' });
  }
  matched.notes = req.body.notes || '';
  res.json(matched);
});

app.post('/api/donors/:id/tag', (req, res) => {
  const matched = donors.find(d => d.id === req.params.id);
  if (!matched) {
    return res.status(404).json({ message: 'Donor not found' });
  }
  matched.tags = req.body.tags || [];
  res.json(matched);
});

// Volunteers Endpoints
app.get('/api/volunteers', (req, res) => {
  res.json(volunteers);
});

app.post('/api/volunteers', (req, res) => {
  const { name, email, whatsapp, city, skills, interestArea, availability, experience } = req.body;

  if (!name || !email || !whatsapp) {
    return res.status(400).json({ message: 'Name, email, and WhatsApp coordinates are mandatory.' });
  }

  const newVolunteer = {
    id: `V-${String(volunteers.length + 1).padStart(2, '0')}`,
    name,
    email,
    whatsapp,
    city: city || 'Indonesia',
    skills: skills || ['Umum'],
    interestArea: interestArea || ['Sosial'],
    availability: availability || 'Weekend',
    experience: experience || '',
    status: 'pending' as const,
    registeredDate: new Date().toISOString().split('T')[0]
  };

  volunteers.push(newVolunteer);
  res.status(201).json(newVolunteer);
});

app.post('/api/volunteers/:id/status', (req, res) => {
  const matched = volunteers.find(v => v.id === req.params.id);
  if (!matched) {
    return res.status(404).json({ message: 'Volunteer not found' });
  }
  matched.status = req.body.status || 'pending';
  res.json(matched);
});

// CSR Inquiries Endpoints
app.get('/api/csr-inquiries', (req, res) => {
  res.json(csrInquiries);
});

app.post('/api/csr-inquiries', (req, res) => {
  const { companyName, picName, position, email, whatsapp, website, budgetRange, interestedProgram, locationTarget, message } = req.body;

  if (!companyName || !picName || !email || !whatsapp) {
    return res.status(400).json({ message: 'Company Name, PIC Name, Email, and WhatsApp are required.' });
  }

  const newInquiry = {
    id: `CSR-${String(csrInquiries.length + 1).padStart(2, '0')}`,
    companyName,
    picName,
    position: position || 'PIC',
    email,
    whatsapp,
    website: website || '',
    budgetRange: budgetRange || 'Rp50.000.000 - Rp100.000.000',
    interestedProgram: interestedProgram || 'Sosial',
    locationTarget: locationTarget || 'Nasional',
    message: message || '',
    pipelineStatus: 'new' as const,
    createdDate: new Date().toISOString().split('T')[0]
  };

  csrInquiries.push(newInquiry);
  res.status(201).json(newInquiry);
});

app.post('/api/csr-inquiries/:id/pipeline', (req, res) => {
  const matched = csrInquiries.find(c => c.id === req.params.id);
  if (!matched) {
    return res.status(404).json({ message: 'Inquiry not found' });
  }
  matched.pipelineStatus = req.body.pipelineStatus || 'new';
  res.json(matched);
});

// Reports Endpoints
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/reports', (req, res) => {
  const { title, campaignSlug, type, period, totalReceived, totalDisbursed, description } = req.body;
  if (!title || !period) {
    return res.status(400).json({ message: 'Title and Period are required fields.' });
  }

  const rec = Number(totalReceived) || 0;
  const disb = Number(totalDisbursed) || 0;

  const newReport = {
    id: `RP-${String(reports.length + 1).padStart(2, '0')}`,
    title,
    campaignSlug: campaignSlug || '',
    type: type || 'Monthly Report',
    period,
    totalReceived: rec,
    totalDisbursed: disb,
    remainingBalance: Math.max(0, rec - disb),
    publicVisibility: true,
    auditStatus: 'published' as const,
    description: description || `Laporan audit pertanggungjawaban amil untuk masa kepengurusan ${period}.`,
    publishedDate: new Date().toISOString().split('T')[0]
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});

// Blogs Endpoints
app.get('/api/blogs', (req, res) => {
  res.json(blogs);
});

app.post('/api/blogs', (req, res) => {
  const { title, category, author, excerpt, content, language } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and Content are required.' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newPost = {
    id: `B-${String(blogs.length + 1).padStart(2, '0')}`,
    title,
    slug,
    category: category || 'Umum',
    author: author || 'Admin AIF',
    status: 'published' as const,
    excerpt: excerpt || title,
    content,
    language: language || 'id',
    publishedDate: new Date().toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
  };

  blogs.push(newPost);
  res.status(201).json(newPost);
});

// FAQ Endpoint
app.get('/api/faqs', (req, res) => {
  res.json(faqs);
});

// Testimonials Endpoint
app.get('/api/testimonials', (req, res) => {
  res.json(testimonials);
});

// ---------------------------------------------------------
// TRANSLATION API (Powered by Gemini)
// ---------------------------------------------------------
app.post('/api/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing parameter: text or targetLang' });
  }

  // Pre-seed common Indonesian-to-English phrases for robust fallback
  const fallbackDict: Record<string, Record<string, string>> = {
    'Beasiswa 1.000 Anak Yatim dan Dhuafa': {
      en: 'Academic Scholarships for 1,000 Orphans & Dhuafa',
      ar: 'المنح الدراسية لـ 1,000 من الأيتام والمحتاجين',
      zh: '1,000 名困难及孤儿全额教育奖学金计划',
      ja: '孤児・困窮世帯の子供1,000名への就学奨学金'
    },
    'Bantu anak yatim dan dhuafa melanjutkan pendidikan melalui beasiswa bulanan, perlengkapan sekolah, dan mentoring.': {
      en: 'Support underprivileged orphans and dhuafa to continue their education through monthly stipends, essential school supplies, and active academic mentoring.',
      ar: 'دعم الأيتام والمحتاجين لمواصلة تعليمهم من خلال المنح الشهرية، المستلزمات المدرسية الأساسية، والتوجيه الأكاديمي.',
      zh: '通过每月生活津贴发放、学习文具和成长导师一对一辅导，长期帮扶孤儿与困难家庭子女完成正规学业。',
      ja: '月々の生活奨学金の支給、学用品 of 提供、および個別学習メンターシップを通じて、困窮世帯の子供たちの進学を長期的に支援します。'
    },
    'Wakaf Pembangunan Pesantren Tahfidz': {
      en: 'Perpetual Wakaf for Tahfidz Boarding School Construction',
      ar: 'وقف جاري لبناء مدرسة تحفيظ القرآن الكريم',
      zh: 'Tahfidz 寄宿制古兰经学院永恒土地/基建瓦合甫',
      ja: 'Tahfidz 寄宿制イスラム学校の建設・永続ワクフ'
    },
    'Bangun pesantren tahfidz untuk santri yatim dan dhuafa dengan fasilitas asrama, kelas, masjid, dan dapur umum.': {
      en: 'Build a dedicated sharia tahfidz boarding school for orphan and dhuafa students complete with clean dormitories, classrooms, a community mosque, and a public kitchen.',
      ar: 'بناء مدرسة تحفيظ متكاملة للطلاب الأيتام والفقراء تشمل مهاجع نظيفة، قاعات دراسية، مسجداً، ومطبخاً خدمياً.',
      zh: '为孤儿和困难家庭的学生建设一所全日制 Tahfidz 寄宿学院，涵盖清洁宿舍、多媒体教学楼、礼拜大堂及中央食堂。',
      ja: '孤児や困窮学生のためのTahfidz寄宿学校を建設。衛生的な寄宿舎、教室棟、礼拝堂、共同食堂などの基本設備を完備します。'
    },
    'Bantuan Pangan untuk 5.000 Keluarga Dhuafa': {
      en: 'Nutritional Food Packages for 5,000 Destitute Families',
      ar: 'المساعدات الغذائية لـ 5,000 أسرة محتاجة',
      zh: '5,000 户困难家庭基本口粮与营养包分发计划',
      ja: '困窮家庭5,000世帯への緊急食料・栄養物資パック配給'
    },
    'Paket pangan berisi beras, minyak, telur, gula, dan kebutuhan pokok lainnya untuk keluarga dhuafa prasejahtera.': {
      en: 'Provides essential food baskets containing rice, cooking oil, protein eggs, sugar, and other core daily necessities for underprivileged families.',
      ar: 'سلال غذائية أساسية تحتوي على الأرز وزيت الطهي والبيض والسكّر والاحتياجات الأساسية الأخرى للأسر المتعففة.',
      zh: '为预备中低收入困难家庭提供大米、食用油、鸡蛋、白糖等核心生活必需品关怀包。',
      ja: '低所得の困窮家庭に対し、米、食用油、卵、砂糖などの基本的な生活必需品を含む食料バスケットを提供します。'
    },
    'Bantu Sekarang': {
      en: 'Donate Now',
      ar: 'تبرع الآن',
      zh: '现在支持',
      ja: '今すぐ支援'
    },
    'Detail': {
      en: 'Details',
      ar: 'التفاصيل',
      zh: '查看详情',
      ja: '詳細を見る'
    },
    'Sisa': {
      en: 'Remaining',
      ar: 'المتبقي',
      zh: '剩余目标',
      ja: '残り必要額'
    }
  };

  const cleanText = text.trim();
  
  if (targetLang === 'id') {
    return res.json({ translation: text });
  }

  // Check fallback dict first
  if (fallbackDict[cleanText] && fallbackDict[cleanText][targetLang]) {
    return res.json({ translation: fallbackDict[cleanText][targetLang] });
  }

  // Try case-insensitive lookup
  const lowerText = cleanText.toLowerCase();
  for (const [key, langs] of Object.entries(fallbackDict)) {
    if (key.toLowerCase() === lowerText && langs[targetLang]) {
      return res.json({ translation: langs[targetLang] });
    }
  }

  if (ai) {
    try {
      const userPrompt = `Translate the following text strictly into target language code "${targetLang}". Return ONLY the translation itself, without any introductory words, explanations, quotation marks, or markdown wrappers. Keep formatting (like paragraph breaks) if any.\n\nText: "${text}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: 'You are an elite, highly professional translation agent for Amanah Impact Foundation. Translate text accurately, naturally, and with high fidelity to the original human emotional and professional tone. Do not add metadata, explanations, quotes, or notes.'
        }
      });
      
      let translation = response.text || '';
      translation = translation.trim();
      
      // Clean up wrapping quotes if Gemini accidentally included them
      if (translation.startsWith('"') && translation.endsWith('"')) {
        translation = translation.slice(1, -1).trim();
      } else if (translation.startsWith('\'') && translation.endsWith('\'')) {
        translation = translation.slice(1, -1).trim();
      }

      if (translation) {
        return res.json({ translation });
      }
    } catch (error) {
      console.error('Translation error using Gemini API:', error);
    }
  }

  // If no AI initialized or call failed, return a clean simulated draft or the text itself
  const simulatedTranslation = text;

  return res.json({ translation: simulatedTranslation });
});

app.post('/api/translate-batch', async (req, res) => {
  const { texts, targetLang } = req.body;
  if (!Array.isArray(texts) || !targetLang) {
    return res.status(400).json({ error: 'Missing parameter: texts (array) or targetLang' });
  }

  const results: Record<string, string> = {};

  if (targetLang === 'id') {
    for (const txt of texts) {
      results[txt] = txt;
    }
    return res.json({ translations: results });
  }

  const fallbackDict: Record<string, Record<string, string>> = {
    'Beasiswa 1.000 Anak Yatim dan Dhuafa': {
      en: 'Academic Scholarships for 1,000 Orphans & Dhuafa',
      ar: 'المنح الدراسية لـ 1,000 من الأيتام والمحتاجين',
      zh: '1,000 名困难及孤儿全额教育奖学金计划',
      ja: '孤児・困窮世帯の子供1,000名への就学奨学金'
    },
    'Bantu anak yatim dan dhuafa melanjutkan pendidikan melalui beasiswa bulanan, perlengkapan sekolah, dan mentoring.': {
      en: 'Support underprivileged orphans and dhuafa to continue their education through monthly stipends, essential school supplies, and active academic mentoring.',
      ar: 'دعم الأيتام والمحتاجين لمواصلة تعليمهم من خلال المنح الشهرية، المستلزمات المدرسية الأساسية، والتوجيه الأكاديمي.',
      zh: '通过每月生活津贴发放、学习文具和成长导师一对一辅导，长期帮扶孤儿与困难家庭子女完成正规学业。',
      ja: '月々の生活奨学金の支給、学用品 of 提供、および個別学習メンターシップを通じて、困窮世帯の子供たちの進学を長期的に支援します。'
    },
    'Wakaf Pembangunan Pesantren Tahfidz': {
      en: 'Perpetual Wakaf for Tahfidz Boarding School Construction',
      ar: 'وقف جاري لبناء مدرسة تحفيظ القرآن الكريم',
      zh: 'Tahfidz 寄宿制古兰经学院永恒土地/基建瓦合甫',
      ja: 'Tahfidz 寄宿制イスラム学校 of 建設・永続ワクフ'
    },
    'Bangun pesantren tahfidz untuk santri yatim dan dhuafa dengan fasilitas asrama, kelas, masjid, dan dapur umum.': {
      en: 'Build a dedicated sharia tahfidz boarding school for orphan and dhuafa students complete with clean dormitories, classrooms, a community mosque, and a public kitchen.',
      ar: 'بناء مدرسة تحفيظ متكاملة للطلاب الأيتام والفقراء تشمل مهاجع نظيفة، قاعات دراسية، مسجداً، ومطبخاً خدمياً.',
      zh: '为孤儿和困难家庭的学生建设一所全日制 Tahfidz 寄宿学院，涵盖清洁宿舍、多媒体教学楼、礼拜大堂及中央食堂。',
      ja: '孤児や困窮学生のためのTahfidz寄宿学校を建設。衛生的な寄宿舎、教室棟、礼拝堂、共同食堂などの基本設備を完備します。'
    },
    'Bantuan Pangan untuk 5.000 Keluarga Dhuafa': {
      en: 'Nutritional Food Packages for 5,000 Destitute Families',
      ar: 'المساعدات الغذائية لـ 5,000 أسرة محتاجة',
      zh: '5,000 户困难家庭基本口粮与营养包分发计划',
      ja: '困窮家庭5,000世帯への緊急食料・栄養物資パック配給'
    },
    'Paket pangan berisi beras, minyak, telur, gula, dan kebutuhan pokok lainnya untuk keluarga dhuafa prasejahtera.': {
      en: 'Provides essential food baskets containing rice, cooking oil, protein eggs, sugar, and other core daily necessities for underprivileged families.',
      ar: 'سلال غذائية أساسية تحتوي على الأرز وزيت الطهي والبيض والسكّر والاحتياجات الأساسية الأخرى للأسر المتعففة.',
      zh: '为预备中低收入困难家庭提供大米、食用油、鸡蛋、白糖等核心生活必需品关怀包。',
      ja: '改善が必要な低所得世帯に対し、米、食用油、卵、砂糖などの基本的な生活必需品を含む食料バスケットを提供します。'
    },
    'Bantu Sekarang': {
      en: 'Donate Now',
      ar: 'تبرع الآن',
      zh: '现在支持',
      ja: '今すぐ支援'
    },
    'Detail': {
      en: 'Details',
      ar: 'التفاصيل',
      zh: '查看详情',
      ja: '詳細を見る'
    },
    'Sisa': {
      en: 'Remaining',
      ar: 'المتبقي',
      zh: '剩余目标',
      ja: '残り必要額'
    },
    'Pendidikan': {
      en: 'Education',
      ar: 'التعليم',
      zh: '教育',
      ja: '教育'
    },
    'Wakaf': {
      en: 'Wakaf',
      ar: 'الوقف',
      zh: '瓦合甫',
      ja: 'ワクフ'
    },
    'Pangan': {
      en: 'Food',
      ar: 'الغذاء',
      zh: '粮食',
      ja: '食料支援'
    },
    'Kesehatan': {
      en: 'Healthcare',
      ar: 'الصحة',
      zh: '医疗卫生',
      ja: '医療・健康支援'
    },
    'Kemanusiaan': {
      en: 'Humanitarian',
      ar: 'الإنسانية',
      zh: '人道主义',
      ja: '人道支援'
    },
    'Ekonomi': {
      en: 'Economic',
      ar: 'التمكين الاقتصادي',
      zh: '经济赋能',
      ja: '経済支援'
    },
    'Jakarta, Bogor, Depok, Tangerang, Bekasi': {
      en: 'Jakarta Metropolitan Area (Jabodetabek)',
      ar: 'منطقة جاكرتا الكبرى (جابوديتابيك)',
      zh: '雅加达大都市圈 (Jabodetabek)',
      ja: 'ジャカルタ首都圏 (Jabodetabek)'
    },
    'Cianjur, Jawa Barat': {
      en: 'Cianjur, West Java',
      ar: 'سيانجور، جاوة الغربية',
      zh: '西爪哇省  Cianjur',
      ja: '西ジャワ州チアンジュール'
    },
    'DKI Jakarta, Banten, Jawa Barat': {
      en: 'Jakarta, Banten, & West Java',
      ar: 'جاكرتا، بانتن، وجاوة الغربية',
      zh: '雅加达、万丹与西爪哇地区',
      ja: 'ジャカルタ、バンテン、西ジャワ地方'
    }
  };

  const textsToTranslateInGemini: string[] = [];

  for (const rawText of texts) {
    const txt = rawText.trim();
    if (!txt) {
      results[rawText] = '';
      continue;
    }

    if (fallbackDict[txt] && fallbackDict[txt][targetLang]) {
      results[rawText] = fallbackDict[txt][targetLang];
      continue;
    }

    let foundFallback = false;
    const lowerText = txt.toLowerCase();
    for (const [key, valueMap] of Object.entries(fallbackDict)) {
      if (key.toLowerCase() === lowerText && valueMap[targetLang]) {
        results[rawText] = valueMap[targetLang];
        foundFallback = true;
        break;
      }
    }

    if (foundFallback) continue;

    textsToTranslateInGemini.push(txt);
  }

  if (textsToTranslateInGemini.length > 0 && ai) {
    try {
      const userPrompt = `Translate the following list of Indonesian texts into target language code "${targetLang}". Return a JSON object with the original texts as keys and translated texts as values.\n\nTexts to translate:\n${JSON.stringify(textsToTranslateInGemini)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: `You are an elite, highly professional translation agent for Amanah Impact Foundation. Translate text accurately, naturally, and with high fidelity to the original human emotional and professional tone. Return ONLY a valid JSON object of type Record<string, string> containing the translations.`
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        for (const [orig, trans] of Object.entries(parsed)) {
          results[orig] = String(trans);
        }
      } catch (e) {
        console.error('Error parsing JSON response from Gemini API for batch translation:', e, responseText);
      }
    } catch (error) {
      console.error('Batch translation error using Gemini API:', error);
    }
  }

  for (const rawText of texts) {
    if (results[rawText] === undefined) {
      results[rawText] = rawText;
    }
  }

  res.json({ translations: results });
});

// ---------------------------------------------------------
// SERVER-SIDE AI LIGHT FEATURES API (Powered by Gemini 3.5 Flash)
// ---------------------------------------------------------

app.post('/api/ai/assist', async (req, res) => {
  const { contentType, prompt, textToTranslate, targetLanguage } = req.body;

  if (!contentType) {
    return res.status(400).json({ error: 'Missing parameter: contentType' });
  }

  // Pre-configured system instructions reflecting humanitarian tone
  let systemInstruction = 'Anda adalah asisten AI profesional untuk Yayasan Amanah Impact Foundation. ';
  let userPrompt = '';

  switch (contentType) {
    case 'campaign':
      systemInstruction += 'Tugas Anda menulis cerita kampanye donasi sosial yang bernada humanis, emosional, transparan, dan menggugah hati pembaca.';
      userPrompt = `Buatkan draf deskripsi cerita dan target program untuk usulan kampanye ini: "${prompt}". Sertakan latar belakang masalah, solusi yang ditawarkan, dan rincian penggunaan dana dalam bentuk poin-poin rapi.`;
      break;

    case 'faq':
      systemInstruction += 'Tugas Anda menjawab pertanyaan donatur seputar zakat, wakaf, sedekah, transparansi audit, dan penyaluran dana secara ramah, syariah, dan tuntas.';
      userPrompt = `Pertanyaan donatur: "${prompt}". Jawab sesingkat, sejelas, dan seramah mungkin berlandaskan syariah amil dan pedoman modern.`;
      break;

    case 'impact':
      systemInstruction += 'Tugas Anda merangkum narasi dampak sosial dari laporan penyaluran dana agar korporasi (CSR) maupun perorangan bersemangat mendukung.';
      userPrompt = `Buat narasi laporan dampak (impact report story) berdasarkan detail bantuan berikut: "${prompt}". Buat agar kaya emosi, bersyukur, dan menonjolkan transparansi dana.`;
      break;

    case 'reply':
      systemInstruction += 'Tugas Anda menyusun draf balasan pesan WhatsApp / Email yang ramah dan apresiatif bagi donatur atau sukarelawan.';
      userPrompt = `Susun pesan balasan ramah terimakasih atau follow up berdasarkan situasi ini: "${prompt}". Sisipkan salam Islami yang sopan dan tautan konfirmasi.`;
      break;

    case 'translate':
      systemInstruction += 'Tugas Anda menerjemahkan konten yayasan sosial dengan sangat akurat dan melestarikan nada humanisnya ke bahasa target.';
      userPrompt = `Terjemahkan teks berikut ke bahasa "${targetLanguage || 'English'}":\n\n"${textToTranslate || prompt}"`;
      break;

    default:
      userPrompt = prompt;
  }

  // Execute Gemini SDK if initialized, otherwise gracefully render simulated draft
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.75,
        }
      });

      const generatedText = response.text;
      return res.json({ result: generatedText, isSimulated: false });
    } catch (error: any) {
      console.error('Error invoking Gemini API:', error);
      // Propagate nicely with fallback
      return res.status(200).json({
        result: `[Gemini API key is unconfigured or rate limited. Menampilkan draf usulan AI asisten]\n\nBerikut usulan draf asisten:\n\n${getMockAIDraft(contentType, prompt || textToTranslate, targetLanguage)}`,
        isSimulated: true
      });
    }
  } else {
    // Graceful Simulated Fallback (No crash, fully functional!)
    const simulatedDraft = getMockAIDraft(contentType, prompt || textToTranslate, targetLanguage);
    return res.json({
      result: `[Integrasi Gemini Real-Time berjalan dalam Mode Simulasi]\n\n${simulatedDraft}`,
      isSimulated: true
    });
  }
});

// Helper function to return simulated drafts
function getMockAIDraft(type: string, input: string, targetLang?: string): string {
  if (type === 'campaign') {
    return `### DRAFT KAMPANYE: ${input || 'Peduli Masa Depan Sesama'}\n\n**Latar Belakang:**\nDi tengah berbagai kesulitan ekonomi, banyak keluarga dhuafa harus berjuang ekstra keras bahkan sekadar untuk mendapatkan pangan harian sehat dan biaya sekolah dasar anak-anak mereka. Kesulitan ini menghambat impian masa kecil mereka.\n\n**Solusi:**\nMelalui program gotong-royong di Amanah Impact Foundation (AIF), mari salurkan santunan terstruktur, bantuan pemenuhan nutrisi, dan beasiswa berkelanjutan sehingga impian mereka tetap tumbuh mekar.\n\n**Rincian Penggunaan Dana:**\n- 60% Pembelian Kit Nutrisi & Beasiswa Pendidikan\n- 25% Biaya Mentor & Kegiatan Pendampingan\n- 15% Distribusi Lapangan & Pelaporan Transparansi`;
  }
  if (type === 'faq') {
    return `Halo Kak! Terima kasih banyak atas pertanyaan hangatnya mengenai program di AIF.\n\nSetiap dana zakat dan wakaf yang diamanahkan kepada Amanah Impact Foundation (AIF) disalurkan secara profesional dan transparan merujuk pedoman syariah MUI (untuk Zakat) dan Nadzir Wakaf BWI (untuk Wakaf). Kami merilis Laporan Penyaluran serta Audit Keuangan lengkap secara terbuka di halaman Transparansi setiap bulannya. Kakak dapat selalu mengunduh laporan realisasi dana kami di web. Insya Allah penuh berkah dan amanah!`;
  }
  if (type === 'impact') {
    return `### LAPORAN DAMPAK: Bergerak Memberi Manfaat\n\nAlhamdulillah, berkat kedermawanan dan kepercayaan penuh para muzakki dan donatur sekalian, bantuan sosial ini telah tersalurkan secara tuntas. Dampak nyata dari inisiatif ini:\n- **Peningkatan Gizi Anak**: Sebelas keluarga kini memiliki persediaan pangan cukup.\n- **Impian Sekolah Berlanjut**: Santri asnaf menerima paket beasiswa belajar.\n\nSetiap langkah kecil yang kita galang berdampak abadi bagi mereka. Terima kasih atas kepedulian tulus Anda!`;
  }
  if (type === 'reply') {
    return `Assalamu’alaikum Warahmatullahi Wabarakatuh Kak,\n\nTerima kasih banyak atas kedermawanan luar biasa yang Kakak berikan melalui Amanah Impact Foundation. Kami mengonfirmasi bahwa amanah donasi Kakak sebesar nominal yang ditransfer telah kami terima dan akan langsung kami salurkan tuntas demi kemaslahatan program.\n\nKakak dapat melacak penyaluran dana secara live serta mengunduh kuitansi resmi (receipt) melalui tautan berikut. Semoga menjadi pahala jariah yang melimpah dan pembawa keberkahan mendalam bagi keluarga Kakak. Amin.\n\nSalam hangat,\n**Tim Amil Amanah Impact Foundation**`;
  }
  if (type === 'translate') {
    const lang = targetLang || 'English';
    return `[Translated into ${lang}]\n\n"Dear honorable donors, thank you very much for your incredible trust and support for the Amanah Impact Foundation campaigns. We guarantee that 100% of your generous donations will be disbursed directly and transparently to empower those in extreme need. You can inspect our periodic financial records on the Transparency Ledger page."`;
  }
  return `Berikut adalah draf masukan asisten digital: \nRealisasi rincian "${input || 'Program Sosial'}" akan dialokasikan penuh demi kesejahteraan mustahik dhuafa.`;
}

// ---------------------------------------------------------
// VITE OR STATIC BUILD MIDDLEWARE
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Using Vite development server middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('serving build production from dist directory.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NGO Platform dev server active on: http://localhost:${PORT}`);
  });
}

startServer();
