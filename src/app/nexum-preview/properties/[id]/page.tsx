"use client";
import React from 'react';
import { useParams } from 'next/navigation';

export default function NexumPropertyDetailPreview() {
  // simple preview route — shows static HTML similar to Nexum detail
  const html = `
<main class="max-w-7xl mx-auto px-6 py-10">
  <section class="mb-8">
    <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Canaan Lodge</h1>
    <div class="flex items-center text-sm font-medium text-gray-500 mt-2">
      <span class="text-gray-400 mr-1 text-lg">📍</span>
      <span>8 Canaan Street, Zone A, Redemption City, Km 46 Lagos-Ibadan Expressway</span>
    </div>
  </section>
  <section class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
    <div class="lg:col-span-2 relative">
      <div class="rounded-3xl overflow-hidden aspect-[16/10] shadow-xl border border-gray-100">
        <img alt="Canaan Lodge Building" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLvRbx4pmkNU1yt6Z8Dt8MTXkt6Shm742q_SX8qgaEZy77ezFq6oUVZo1XHYdCcqKoz0xpaDtNiHB5FEMJG3BNUil9c4-BmVEPMf2vUpx4HpgwuUWkMXXY89hXxQtNuGougcsmCVu48wfp7f1k42G506VbZ7T2FOxlMaEPToS05-8lbUpOt4X737bdTpVfSZlr4iEw1QJagkbYaRkEVKUEkO0uzpO1kDsMHk2JElE7UIftrFIKGpbd-VikY"/>
      </div>
    </div>
    <div class="space-y-6">
      <div class="bg-white p-8 rounded-3xl custom-shadow border border-gray-100">
        <h2 class="text-xl font-bold mb-4 tracking-tight">About this property</h2>
        <p class="text-gray-600 text-sm leading-relaxed mb-8">
          Budget-friendly accommodation close to the Camp Arena. Shared facilities with hot water, clean bedding provided, and a communal kitchen.
        </p>
      </div>
    </div>
  </section>
</main>
`;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
