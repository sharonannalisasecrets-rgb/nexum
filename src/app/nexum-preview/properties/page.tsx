"use client";
import React from 'react';

export default function NexumPropertiesPreview() {
  const html = `
<section class="hero-gradient pt-44 pb-24 px-6 text-center text-white" style="background-size:cover;background-position:center;">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">Redemption City Accommodation</h1>
    <p class="text-xl text-white/90 mb-12 font-medium max-w-2xl mx-auto drop-shadow-sm">Browse approved guest properties for Holy Ghost Congress and monthly services</p>
    <div class="relative max-w-xl mx-auto mb-20">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path></svg>
      </div>
      <input class="w-full pl-11 pr-4 py-4 rounded-lg text-gray-800 border-none focus:ring-2 focus:ring-orange-500 shadow-2xl text-base font-medium placeholder:text-gray-400" placeholder="search favorite properties..." type="text"/>
    </div>
  </div>
</section>
<main class="max-w-7xl mx-auto px-6 py-20">
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    <article class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <img alt="Moses Apartment" class="w-full h-48 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0cyBpDGBEQOw3Hg4levw3n5DwtOsn6GAJULgFZW8QdPQgBO-GtyA6dFd3_R6_DlD3bkWBnbHC_qub3wcgcGqQHofiiDsKx3LKwQVuZnnitOy1UEaH3qgxUDMmoI4Zxz3OBGePlWDGsAaTwSkh_XxXhOibc_JlT2mHp8Gc-zd0OzGWHJT_CKCQYQI47-IV4ea_4R1kgciQlBPHxseAd7Zpz4y8RgK0u2JP-BDA6xVUIKL_60wXgH4ZXdNzoSNAFaWuDFdyGfIJYJ0"/>
      <div class="p-5">
        <h3 class="font-bold text-gray-900 text-base mb-1.5">Moses Apartment</h3>
        <p class="text-xs text-gray-500 mb-5 leading-relaxed font-medium">Beside Old Auditorium, Redemption City, Mowe, Ogun State.</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-full flex items-center gap-1.5">Host: Chinedu Okafor</span>
          <button class="text-[11px] border border-gray-200 px-3.5 py-2 rounded-lg hover:bg-gray-50 font-bold text-gray-700 transition-colors">View Rooms</button>
        </div>
      </div>
    </article>
    <!-- repeat sample cards as preview -->
  </div>
</main>
`;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
