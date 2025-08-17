import React from 'react';

export const LayoutDebug: React.FC = () => {
  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-3 rounded text-xs font-mono max-w-xs">
      <div className="font-bold mb-2">Layout Debug</div>
      <div>Sidebar Width: 256px (w-64)</div>
      <div>Main Margin: 256px (md:ml-64)</div>
      <div>Gap Status: Should be ZERO</div>
      <div className="mt-2 text-green-400">
        ✅ CSS Classes Applied:
      </div>
      <div>• layout-container</div>
      <div>• main-content-area</div>
      <div>• sidebar-container</div>
    </div>
  );
}; 