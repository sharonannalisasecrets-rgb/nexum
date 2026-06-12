"use client";
import React from 'react';

export default function NexumLandingPreview() {
  const html = `
<!-- Nexum landing page (excerpt) -->
<header class="bg-nexum-blue py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-md">
  <div class="flex items-center gap-2">
    <div class="bg-white p-2 rounded-md shadow-sm">
      <span class="font-extrabold text-nexum-blue text-sm tracking-tight">Nexum</span>
    </div>
  </div>
  <nav class="hidden md:flex items-center gap-8 text-white text-sm font-semibold">
    <a class="hover:text-nexum-orange transition-colors flex items-center gap-1" href="#">Features</a>
    <a class="hover:text-nexum-orange transition-colors" href="#">Media</a>
    <a class="hover:text-nexum-orange transition-colors flex items-center gap-1" href="#">Properties</a>
  </nav>
  <div>
    <button class="bg-nexum-orange text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-sm">
      Login / Sign up
    </button>
  </div>
</header>
<section class="hero-image-bg pt-24 pb-16 px-6 text-center relative" style="background-size:cover;background-position:center;">
  <div class="max-w-4xl mx-auto relative z-10">
    <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
      Safety Intelligence for <br/><span class="text-nexum-blue">Redemption City</span>
    </h1>
    <p class="text-slate-700 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
      Real-time emergency dispatch, automated escalation, and crowd coordination for the world's largest regular gathering — 5 million worshippers, one platform.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
      <button class="bg-nexum-blue text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:bg-nexum-dark-blue hover:-translate-y-0.5 transition-all w-full sm:w-auto">Create Account</button>
      <button class="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-800 px-10 py-4 rounded-xl font-bold hover:bg-white transition-all w-full sm:w-auto shadow-lg">Browse Properties</button>
    </div>
  </div>
</section>
<section class="py-24 px-6 bg-white">
  <div class="max-w-6xl mx-auto text-center">
    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">One platform, every module</h2>
    <p class="text-slate-500 font-medium">Built specifically for Redemption City. Each module addresses a real operational failure.</p>
  </div>
</section>
`;

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
