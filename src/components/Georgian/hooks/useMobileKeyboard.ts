import { useEffect } from 'react';

export function useMobileKeyboard() {
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const onResize = () => {
      const keyboardHeight = window.innerHeight - visualViewport.height;
      document.body.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    };

    visualViewport.addEventListener('resize', onResize);

    return () => {
      visualViewport.removeEventListener('resize', onResize);
      document.body.style.removeProperty('--keyboard-height');
    };
  }, []);
}