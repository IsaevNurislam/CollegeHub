import React from 'react';

export default function IsLoading({ active, label = 'Загрузка...' }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/90 px-6 py-5 shadow-lg">
        <div className="h-12 w-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  );
}
