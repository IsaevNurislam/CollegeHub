import React from 'react';

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
      active 
        ? "text-sky-600 bg-sky-50 border-r-4 border-sky-600"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    {icon}
    <span className="font-medium text-sm sm:text-base">{label}</span>
  </button>
);

export default SidebarItem;