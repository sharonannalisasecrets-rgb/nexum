import { propertyApi } from '@/lib/api';
import { Property } from '@/types';
import Link from 'next/link';
import { MapPin, AlertCircle } from 'lucide-react';

export const revalidate = 60;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 1);

  // Gracefully handle backend being offline
  let properties: Property[] = [];
  let totalPages = 0;
  let totalCount = 0;
  let backendOffline = false;

  try {
    const res = await propertyApi.list({ page, pageSize: 16 });
    if (res.success && res.data) {
      properties = res.data.items ?? [];
      totalPages = res.data.totalPages ?? 0;
      totalCount = res.data.totalCount ?? 0;
    }
  } catch {
    backendOffline = true;
  }

  // Fallback sample properties to display when the backend is not reachable
  const SAMPLE_PROPERTIES: Property[] = [
    { id: 'sample-1', name: 'Moses Apartment', description: 'Beside Old Auditorium, Redemption City, Mowe, Ogun State.', address: 'Beside Old Auditorium, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA0cyBpDGBEQOw3Hg4levw3n5DwtOsn6GAJULgFZW8QdPQgBO-GtyA6dFd3_R6_DlD3bkWBnbHC_qub3wcgcGqQHofiiDsKx3LKwQVuZnnitOy1UEaH3qgxUDMmoI4Zxz3OBGePlWDGsAaTwSkh_XxXhOibc_JlT2mHp8Gc-zd0OzGWHJT_CKCQYQI47-IV4ea_4R1kgciQlBPHxseAd7Zpz4y8RgK0u2JP-BDA6xVUIKL_60wXgH4ZXdNzoSNAFaWuDFdyGfIJYJ0'], hostId: 'host-1', hostName: 'Chinedu Okafor', status: 'Published' },
    { id: 'sample-2', name: 'RCCG Dove Guest House', description: 'Directly beside Moses Apartment, near Old Auditorium, Redemption City, Mowe, Ogun State.', address: 'Directly beside Moses Apartment, near Old Auditorium, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDoembFrOic5yUY1jU_so0Mycpx7UMF5ZVWNRJNwEWOW8I-aURTt3uXsqeG4IeALLccNFfpkhevdV_PYauNWmj-ZJk4DQ3-KfGpuN4fQhJ_R3-v2HKgnvt0Msz7qav1nCV5c3s0PZ2b_ot_-gQyc90INtmdavTGjxqYM9MVjPDobLBqX8SjNUz6rabcIkcmsBK9N8UL2O_LnGI70twBIhj5ATnMh4RwyygwcLMyapB3gADwbJCILHcTzEqqNG2DIpOcQDNNjrTGz5U'], hostId: 'host-2', hostName: 'Oluwaseun Awolowo', status: 'Published' },
    { id: 'sample-3', name: 'Overflow Executive Chalets', description: 'Beside Moses Apartment, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', address: 'Beside Moses Apartment, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAjOsVlF0K9BIAhu57jm8imidbOuFKncw5mFd5eOjc9A22qHsDHgWA6GD40rsloT4JxiUTamG28--D4UuSIydxLKR2P0_eNWgls9ygm-CmdDJDoYSV22hOARbn8nIhGM52Xs3gZJTDwssHXclRwRYBLngwZeHowh76yKPe9ZfXT2gVcmbujQ0Nns8dw1QnlOVAcDXVEo-6xgrpczwCwZRpivdG6GABccHTesgWVs7pVkE80G4Iywpuo-3gYH2o0xALPeKm9vKp18Mw'], hostId: 'host-3', hostName: 'Efeoghene Okoro', status: 'Published' },
    { id: 'sample-4', name: 'Gethsemane Lodges', description: 'Beside Pillar 29, close to Shiloh Apartments, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', address: 'Beside Pillar 29, close to Shiloh Apartments, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAd5cvSjPw3CZ_-ovLXtRi8FDlqorT0D-XydeqTfVH_6tA8BZsfas7jty61u4dyA5wtHiHDbdWoCRtQt1vVWAhgAelXfe8zMbFwl4xMhDGymNxy576WH7IyFAW_Xg-NLjRBpHzMsyIGC7w2ztG87aQx-4ck020O0h-k7f5O63I-hAXISvbPP9ASd_aOsGquvCWNqkCE55oZehU1LZdjDGcr55g3JevcyAefaP9zfkjsrrS9fEJR-r533t1YepvsS_RcdNTwWKfVuBY'], hostId: 'host-4', hostName: 'Chisom Nwachukwu', status: 'Published' },
    { id: 'sample-5', name: 'Shiloh Apartments', description: 'Along Main Inner Access Road, close to Old Auditorium, Redemption City, Mowe, Ogun State.', address: 'Along Main Inner Access Road, close to Old Auditorium, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBWURFrVyqwg7vOI-STtDuKMXYjmRy3ka4SukG8-QQSt-AKKDvBr4fMGtH6sztruDJS47X950ZM7JFsnqKV4-t7gJfKIg0OPzM4hHPDqcy9V2p8-P_AxURRY4AQocTwysvFVkpm4nAkA0ibSCRk9XGi7mAHFHyOR00C9a8qOdA_f7AV2TKAsWF6QoF1yK9jVrm1Q-O6XTJ050o8Aw9nHglDlQa_bugn5TDT5x3ZqQSJ3n93zuiGGltds8uZToqS8feypqlwA6PFu6A'], hostId: 'host-5', hostName: 'Oluwatobiloba Adebayo', status: 'Published' },
    { id: 'sample-6', name: 'Grace Court Apartments', description: 'Directly beside Overflow Apartment Complex, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', address: 'Directly beside Overflow Apartment Complex, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBAr6PMUl6V4G844cCmMFBGD-zba20bLwGhnA1bIVvLp3L1IXFzz5M2uJIatXPUDt_LbTIRChjzGOJ_I63TB3tZSv4H3swsqmd2QP2IJQ8kYid5oTlVsnpgeVLPaJQ1C34s69OE40lGf8-org_eUlLZViKtr_KVTRHwU-8PlL7w3TUaIMqosOveMlaHuhXrE3CQK-2e9y1u1mEQuU4YLdcIdRXR4eiUTIiK8KCDes622Ssexqbirtz32cTNmVKuUIUya9UvxylSmsw'], hostId: 'host-6', hostName: 'Eseoghene Igbinosion', status: 'Published' },
    { id: 'sample-7', name: 'Joy to the Wise Lodge', description: 'Behind Shiloh Apartments Complex, Redemption City, Mowe, Ogun State.', address: 'Behind Shiloh Apartments Complex, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBmNpX33kzdeslTMoFNwZo_QrKX5jmjBdCPMRj4Udwj8XPm1ESU5lS3Se-vTzsTCb3A1XZLsEd7EfurbHealaz2KNt36zJy4IvJs6ebUSDjFgAJsQBER0eU0S3kRKxf-eX2_hLhl8fOMkz5ii3IpgdhoLOL6s56Sed2A4lS2Fik1suzBiZPk4sNw_1MpOAjsd0qblAeNtP7UynKogSt9BHHDIDO_L_lnjKKyzHDHxo3eZDR9tZKatga45ZPr3C3M5vzDirgOcx6zc8'], hostId: 'host-7', hostName: 'Chimezie Uzor', status: 'Published' },
    { id: 'sample-8', name: 'White House Suites', description: 'Near Car Park B/C Zone, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', address: 'Near Car Park B/C Zone, Old Auditorium Axis, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC-QWZ9csPTi73Xrov5GkSGvedvJQrkTjqi2vKIQ78Of06RRFPXFZWPAG6B8opePRB-nvpiVQ9Ye5zAWRsf8xioCfTng0vicRzktwwG3ZKU6SQXlZben0v3dD8imL_cjNBWYWsdRAgoE7J-mYt-eEIpWfCYytL11HvkAvxACgXY3zLDCtI5I-EhhphnRulVe98qAsuLyY6tm8oCUDPXYmXPu5sC7RHP1g_Uh5-E2BUhE1TzIUoiD8KykI2mOfx6wt7kXj2r10XL8KY'], hostId: 'host-8', hostName: 'Ayomide Balogun', status: 'Published' },
    { id: 'sample-9', name: 'Peace Court & Deluxe Apartments', description: 'Car Park C Access Area, Redemption City, Mowe, Ogun State.', address: 'Car Park C Access Area, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCU6wtXzUu0oUGvD7x1fjDvQ7NYaKARTAaLjMNfCHzp6wJbe0Lv4xXou6qNP-DuXwqV9FafWB4qzomLD8UoDlXeTkVga0Tk6ZxIaXSvjX-PHZ47VvwkHcT-T2ijHTfI0XODj7ZzOOcEgAiBjEN8KGgmObtZ2WtdlvmA2KKT8fwbHY-5wVygR9Ygk3C5RMaHkAoYkPnsh-2sG0tp-UMG65zMvua34P0pJfC1nylbRGSox20owWFoTq0VX_o_zKLMhvXXbwA1kxNVDQ8'], hostId: 'host-9', hostName: 'Kanyinsola Ojo', status: 'Published' },
    { id: 'sample-10', name: 'RCCG International Guest Suites', description: 'Christ Embassy Entry Road, near New Auditorium, Simawa/Redemption City, Ogun State.', address: 'Christ Embassy Entry Road, near New Auditorium, Simawa/Redemption City, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBP4nK5paCi7EJjIEYIcL_ENkStkwgcrp_QiQo_T_u9X7GwDPtpvoRBU1IPz7wS3xMXOg2HHUGIYVW0-7FhyqPumnWK8HKSjZgDGUX_GY78hLzjxef_Q53Z0dw0GUbaLN8fO3B6YHBVDhe7xuYzSiDX14X-HxPXQq3-OPADC1Dnen8E9_7fUedMBaW_CfRVapzDG-7ZKJoK2lO5vCNvViHJ71Ff_3vAkA6qwWGmh2CYvT1GW3lXLjhCTb6m4YYxqYZUJEp2J2fz2xs'], hostId: 'host-10', hostName: 'Chukwuebuka Anyanwu', status: 'Published' },
    { id: 'sample-11', name: 'Bethel Suites and Event Centre', description: 'Along New Arena/Shimawa Access Road, Redemption City, Ogun State.', address: 'Along New Arena/Shimawa Access Road, Redemption City, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBRhouw9JApZYCnPbExNnRbyraRVHwm97OdprzOaBbRImn6AlQRv15LssnE75w-6VLL_pJHrQM9eg8N6VrPcHndHSSGhUOfMutG_yzSGx9IaUtQLYQrUnjH4isucDNQrTQOJGWaaHBe_FI7B6FDldFzBtjqYadmoj1PiIWcCVP5imHiL8p9OB4h-oQMjwbmDQH_N9NruXYSAJ0wQINLh9jOTg92SPUiVpQao2n-AaWbq_YcJAcmejh8LSGMA6Fks_kfT_fFIlDZAxY'], hostId: 'host-11', hostName: 'Oluwadamilola Bankole', status: 'Published' },
    { id: 'sample-12', name: 'WestView Apartments', description: 'Behind New Arena Auditorium Perimeter Line, Redemption City, Ogun State.', address: 'Behind New Arena Auditorium Perimeter Line, Redemption City, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBOn4CoCiqzBCkDTsRrSge_W9dXMpKDqEGZyN0M5SfqRym0twd4RSo5kgE3V0BelH0bH1PnIKJ8KLs7g6I1FdNefzOosuP-XsCpiE-2D-5SGpx8OyKj5gs-cQ39nZOs14MukFvohi_al6HeKVpTRKYhwE2srxMIhVnUwT2_83qDDBdMWBi1FK75_0Vu97SaqX1FmlDj_bjKFD_jgdAl350fb1SL6RYX559MyZO5DwgpQ51Ewi-q0HP0H7RZ5Tmfxg7Bs_23-dj7rSM'], hostId: 'host-12', hostName: 'Nwachukwu Egwu', status: 'Published' },
    { id: 'sample-13', name: 'Haggai Estate Residential Blocks', description: 'Premium Residential Zone, Redemption City, Mowe, Ogun State.', address: 'Premium Residential Zone, Redemption City, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA5o_VwyQmpICnuNgtHdoU5uro_ak0SxItmQuiuXUJMfYLrI1_LYpexO9PSkrFJ39X_cuy9F9nCs-bl3Mjk4FMNki3ZkD51Y5Ije1f4cytR4a9gP26VMCwzZIZfn3XUN-Q6V26LIvQX_J9KpY4C8lU7oDf3N_dqlL8hfnCC5aAGuwpp2htmXfovQtRWP6otL-I1i7N0d0o2P3X9K5w0It6uNKQB8WusXaZlxb1iQjhBaN405xHA1B5ZGKZgAsjIzKVFqhWHggwh4DA'], hostId: 'host-13', hostName: 'Diepreye Alamieyeseigha', status: 'Published' },
    { id: 'sample-14', name: 'Dominion Apartment and Guest House', description: '1.14 km from RCCG New Arena Auditorium Perimeter, Mowe, Ogun State.', address: '1.14 km from RCCG New Arena Auditorium Perimeter, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBC8gMX_hqzqCnNUqmIo8TNnsqZGYoQFwQsYMtHXin3ZgBR4oNPBk5GhAXywqgEgepnqNsAn2gryeQ-JGdXvOoj-vh2DBMqmAu4NkUoe8pPCrE7ndIDay_cS1kN6la2XxlPqoKRoGvzSr5KUznMG5UNcCVH6lnW9kGPHckTqm4TmurATetzBEfYyVzCF1urmMtnnLxk6WowadbP-XqpzxzBmd9oqyAvN_o862vJZpaNyDQvasKXHrd4CeqP8bg_C0MpE9zYyaCo-oQ'], hostId: 'host-14', hostName: 'Eniola Alao', status: 'Published' },
    { id: 'sample-15', name: 'Greenland Estate Serviced Apartments', description: 'Lagos-Ibadan Expressway (KM 46), 4 minutes from Redemption Camp Main Gate, Mowe, Ogun State.', address: 'Lagos-Ibadan Expressway (KM 46), 4 minutes from Redemption Camp Main Gate, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC7Oax_bDu5U7BeequN1Rb6Zaq_-KT-I5CL_Wf0y9BrHGTOC5UkFy2gNF_yQWla5Tu89dk3sKWnjurV1bw4UJlvoVkegiJIa6HxDdD05xt6iMY2GL4IvdQQNpjPMczXDq5ijMIgDFuLrwPNfK5x5I2HeJMk2lFIpxoB3s_Ba66LdOvwCvHcTNcWCCr4nUC51EY0-OilBjBhCpia_r4Nl32Zyf8LZTJUE2JRcVlThJ0i5ACI9vjIwj9N_Uw8FH8bBNoL50svz-C_c2E'], hostId: 'host-15', hostName: 'Somtoochukwu Okoye', status: 'Published' },
    { id: 'sample-16', name: 'Makun City Complex Short-Lets', description: 'Lagos-Ibadan Expressway, near RCCG Youth Centre, Mowe, Ogun State.', address: 'Lagos-Ibadan Expressway, near RCCG Youth Centre, Mowe, Ogun State.', photoUrls: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAmZRe2YYFT_3RGswpviSXmE3DEKylfBB3a2YglAX-poYVjGDYQSctcGMqqoJK9A6QTPYdeYT_uqkNNIkWqdpezvL841xVA1Jc6Lr9l2hcafYNTDObR5wrqB-N1I4sKXCtRX35e19eLk7R3kamrpbRQw9wLpTmgZ38xv0sDDx1HEPgXx8QWzH1ViEtQvF0h8rEa5DDOek4igkiZxOWyRgFLV_FJNK5e3mLW_TbBqJ0SLlVwkrilEqAUO2i6IVJpTfwEaqQr6JkP2js'], hostId: 'host-16', hostName: 'Oluwajuwon Oyelami', status: 'Published' },
  ];

  // Show sample properties when no properties were returned
  if (properties.length === 0) {
    properties = SAMPLE_PROPERTIES;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="bg-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-sm"></div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">Nexum</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-white/90 text-sm font-semibold">
            <a className="hover:text-white transition-colors" href="#">Features</a>
            <a className="hover:text-white transition-colors" href="#">Studies</a>
            <a className="hover:text-white transition-colors border-b-2 border-white/50 pb-0.5" href="#">Properties</a>
          </nav>
          <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md text-sm font-bold transition-all shadow-lg">Login / Sign up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="pt-44 pb-24 px-6 text-center text-white"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 68, 160, 0.4) 0%, rgba(0, 48, 115, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAgv9Yl3-1pOEqy87M9ryxyoBtb7g0xtEVTajalB9knCOJdfMAiSCuHMxKJ-94irjQ7mMZEr04xdWFkDKh9mB5msTW6cb913QnVawQ2oQWcUhJSpDePVYGaWQu9Okkj_gZZ6YmL4pDn9_akkypmcrSXMpF7m00tjHU5otry1Uj_xccDAHh1llwOq_tqC_BvV7aBRBZs89g915uNWuBFqQAqdzx2CB218sJUO_EjCEUvD9VSSQyLzGqegD26Y8Qw-W44BXfi1ahHGZE")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">Redemption City Accommodation</h1>
          <p className="text-xl text-white/90 mb-12 font-medium max-w-2xl mx-auto drop-shadow-sm">Browse approved guest properties for Holy Ghost Congress and monthly services</p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
            </div>
            <input className="w-full pl-11 pr-4 py-4 rounded-lg text-gray-800 border-none focus:ring-2 focus:ring-orange-500 shadow-2xl text-base font-medium placeholder:text-gray-400" placeholder="search favorite properties..." type="text"/>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <div className="stats-card-gradient p-6 rounded-xl text-left">
              <h2 className="text-3xl font-black mb-1">5M+</h2>
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/80">Peak worshippers</p>
            </div>
            <div className="stats-card-gradient p-6 rounded-xl text-left">
              <h2 className="text-3xl font-black mb-1">2,500</h2>
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/80">Hectares covered</p>
            </div>
            <div className="stats-card-gradient p-6 rounded-xl text-left">
              <h2 className="text-3xl font-black mb-1">3s</h2>
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/80">Emergency dispatch</p>
            </div>
            <div className="stats-card-gradient p-6 rounded-xl text-left">
              <h2 className="text-3xl font-black mb-1">24/7</h2>
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/80">Always active</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Redemption City Accommodation</h2>
            <p className="text-gray-500 mt-2 font-medium text-lg">Browse approved guest properties for Holy Ghost Congress and monthly services</p>
          </div>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </div>
            <input className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 font-medium transition-all" placeholder="search here for properties..." type="text"/>
          </div>
        </div>

        {/* Backend Offline Banner */}
        {backendOffline && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800">Backend not connected</div>
              <div className="text-sm text-amber-700 mt-1">
                Start the .NET API with <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">dotnet run</code>, then set <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">NEXT_PUBLIC_API_URL</code> in `.env.local`.
              </div>
            </div>
          </div>
        )}

        {/* Property Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>{backendOffline ? 'Properties will appear here once the backend is running' : 'No properties available yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white p-2 rounded">
                <span className="font-black text-slate-900 text-sm">Nexum</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-6">Nexum is the safety intelligence backbone for Redemption City, coordinating millions of worshippers through advanced geospatial technology.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6 text-sm">Platform</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-white transition-colors" href="#">Features</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Media</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Properties</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Security</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6 text-sm">Company</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-white transition-colors" href="#">About</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Contact</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Partners</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6 text-sm">Legal</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-white transition-colors" href="#">Privacy</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Terms</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Cookies</a></li>
              <li><a className="hover:text-white transition-colors" href="#">SLA</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Nexum Intelligence. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Designed for Redemption City</span>
            <span>Powered by Geospatial AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const photo = property.photoUrls?.[0];

  return (
    <Link href={`/properties/${property.id}`}>
      <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <img alt={property.name} className="w-full h-48 object-cover" src={photo || "https://via.placeholder.com/400x300?text=No+Image"} />
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-base mb-1.5">{property.name}</h3>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed font-medium">{property.address}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Host: {property.hostName}
            </span>
            <button className="text-[11px] border border-gray-200 px-3.5 py-2 rounded-lg hover:bg-gray-50 font-bold text-gray-700 transition-colors">View Rooms</button>
          </div>
        </div>
      </article>
    </Link>
  );
}
