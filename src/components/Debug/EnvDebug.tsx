import React from 'react';

export const EnvDebug: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Environment Debug</h4>
      <p><strong>URL:</strong> {supabaseUrl || 'MISSING'}</p>
      <p><strong>Key:</strong> {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING'}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
      <p><strong>Dev:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
    </div>
  );
};