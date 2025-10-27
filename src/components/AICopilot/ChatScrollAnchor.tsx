import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface ChatScrollAnchorProps {
  /**
   * Enable/disable scroll tracking
   * Should be true during streaming or when typing indicator is active
   */
  trackVisibility: boolean;

  /**
   * Reference to the scrollable container
   */
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

/**
 * ChatScrollAnchor - Smart auto-scroll component for streaming chat interfaces
 *
 * Uses Intersection Observer to track if the bottom anchor is visible.
 * When the anchor is out of view and trackVisibility is enabled, it scrolls to bottom.
 *
 * This eliminates the ambiguity of trying to detect user scrolls vs content-growth scrolls.
 *
 * Key behavior:
 * - When anchor is visible (user at bottom) → auto-scrolls as new content arrives
 * - When anchor is not visible (user scrolled up) → no auto-scroll, respects user intent
 * - When user scrolls back to bottom → anchor becomes visible, auto-scroll resumes
 *
 * Based on industry best practices used by ChatGPT, Claude, and other modern AI chat interfaces.
 */
export function ChatScrollAnchor({
  trackVisibility,
  scrollAreaRef,
}: ChatScrollAnchorProps) {
  // Set up Intersection Observer with 100ms delay (minimum with trackVisibility)
  const { ref: anchorRef, inView } = useInView({
    trackVisibility,
    delay: 100,
    threshold: 0, // Trigger as soon as any part is visible
  });

  // Auto-scroll when anchor is not visible but should be tracking
  useEffect(() => {
    if (trackVisibility && !inView && scrollAreaRef.current) {
      // Anchor is out of view, but we're tracking (streaming is happening)
      // Scroll to bottom to bring anchor back into view
      const scrollElement = scrollAreaRef.current;

      // Use instant scroll ('auto') during streaming to avoid animation stutter
      // Each token arrival would restart the smooth animation, causing jank
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'auto', // Instant scroll during streaming
      });
    }
  }, [inView, trackVisibility, scrollAreaRef]);

  // Invisible anchor element at the very bottom of the chat
  return <div ref={anchorRef} className="h-px w-full" aria-hidden="true" />;
}
