import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 max-h-96 overflow-y-auto ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, color = "bg-gray-100 text-gray-800" }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {children}
  </span>
);