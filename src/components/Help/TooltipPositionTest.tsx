import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPositionTestProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TooltipPositionTest: React.FC<TooltipPositionTestProps> = ({
  isVisible,
  onClose
}) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [testPositions, setTestPositions] = useState([
    { id: 'center', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#ff0000' },
    { id: 'top-left', left: '20px', top: '20px', transform: 'none', color: '#00ff00' },
    { id: 'top-right', left: 'calc(100% - 120px)', top: '20px', transform: 'none', color: '#0000ff' },
    { id: 'bottom-left', left: '20px', top: 'calc(100% - 120px)', transform: 'none', color: '#ff00ff' },
    { id: 'bottom-right', left: 'calc(100% - 120px)', top: 'calc(100% - 120px)', transform: 'none', color: '#00ffff' },
  ]);

  // Create portal root
  useEffect(() => {
    if (!isVisible) return;

    let root = document.getElementById('tooltip-test-portal');
    if (!root) {
      root = document.createElement('div');
      root.id = 'tooltip-test-portal';
      root.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 999999 !important;
        background: rgba(0,0,0,0.1) !important;
      `;
      document.body.appendChild(root);

    }
    setPortalRoot(root);

    return () => {
      if (root && root.parentNode) {
        root.parentNode.removeChild(root);

      }
    };
  }, [isVisible]);

  if (!isVisible || !portalRoot) {
    return null;
  }

  const testContent = (
    <>
      {/* Background overlay with grid */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          background: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px),
            rgba(255,255,255,0.8)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 999998
        }}
      />

      {/* Test positions */}
      {testPositions.map((pos, index) => (
        <div
          key={pos.id}
          style={{
            position: 'fixed',
            left: pos.left,
            top: pos.top,
            transform: pos.transform,
            width: '100px',
            height: '100px',
            backgroundColor: `${pos.color} !important`,
            border: '3px solid #000000 !important',
            borderRadius: '12px !important',
            display: 'flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            flexDirection: 'column !important',
            color: '#ffffff !important',
            fontFamily: 'system-ui, monospace !important',
            fontSize: '12px !important',
            fontWeight: 'bold !important',
            textAlign: 'center !important',
            zIndex: 999999,
            pointerEvents: 'none',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3) !important',
            animation: `testPulse${index} 2s ease-in-out infinite !important`,
            opacity: '0.9 !important'
          }}
        >
          <div>{pos.id.toUpperCase()}</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>
            {pos.left}, {pos.top}
          </div>
        </div>
      ))}

      {/* Center crosshairs */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: '40px',
          height: '2px',
          backgroundColor: '#000000',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: '2px',
          height: '40px',
          backgroundColor: '#000000',
          transform: 'translateY(-50%)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff4444 !important',
          color: '#ffffff !important',
          border: 'none !important',
          borderRadius: '50% !important',
          width: '50px !important',
          height: '50px !important',
          fontSize: '24px !important',
          fontWeight: 'bold !important',
          cursor: 'pointer !important',
          display: 'flex !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          zIndex: 999999,
          pointerEvents: 'auto !important',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3) !important'
        }}
        title="Close Position Test"
      >
        ×
      </button>

      {/* Info panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0,0,0,0.9) !important',
          color: '#ffffff !important',
          padding: '16px !important',
          borderRadius: '8px !important',
          fontFamily: 'system-ui, monospace !important',
          fontSize: '14px !important',
          maxWidth: '300px !important',
          zIndex: 999999,
          pointerEvents: 'none !important',
          lineHeight: '1.4 !important'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🧪 Position Test Active
        </div>
        <div>• Red box should be at center</div>
        <div>• Green box at top-left corner</div>
        <div>• Blue box at top-right corner</div>
        <div>• Magenta box at bottom-left</div>
        <div>• Cyan box at bottom-right</div>
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: '0.8' }}>
          If boxes are not visible, there's a CSS/positioning issue.
        </div>
      </div>
    </>
  );

  return createPortal(testContent, portalRoot);
};

// Inject test animations
const testCSS = `
@keyframes testPulse0 {
  0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}
@keyframes testPulse1 {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
@keyframes testPulse2 {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
@keyframes testPulse3 {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
@keyframes testPulse4 {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
`;

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = testCSS;
  if (!document.head.querySelector('style[data-position-test]')) {
    styleEl.setAttribute('data-position-test', 'true');
    document.head.appendChild(styleEl);
  }
}