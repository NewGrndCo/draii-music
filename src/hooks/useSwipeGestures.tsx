
import { useRef, useEffect, TouchEvent } from 'react';
import { useIsMobile } from './use-mobile';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipeGestures(
  elementRef: React.RefObject<HTMLElement>, 
  handlers: SwipeHandlers = {}
) {
  const { 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown, 
    threshold = 50 
  } = handlers || {};
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchMoveCount = useRef<number>(0);
  const isTouchMoving = useRef<boolean>(false);
  const swipeProcessed = useRef<boolean>(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isMobile || !elementRef.current) return;
    
    const element = elementRef.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if it's a single touch
      if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchMoveCount.current = 0;
        isTouchMoving.current = false;
        swipeProcessed.current = false;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null || swipeProcessed.current) return;
      
      touchMoveCount.current += 1;
      
      // Determine if this is a significant movement to be considered a swipe
      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const diffX = touchCurrentX - touchStartX.current;
      const diffY = touchCurrentY - touchStartY.current;
      
      // Use much higher threshold for movement detection
      if (Math.abs(diffX) > threshold * 1.5 || Math.abs(diffY) > threshold * 2) {
        isTouchMoving.current = true;
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null || swipeProcessed.current) return;
      
      // Require much more intentional gestures
      // At least 10 move events and significant movement
      if (touchMoveCount.current < 10 || !isTouchMoving.current) {
        touchStartX.current = null;
        touchStartY.current = null;
        touchMoveCount.current = 0;
        isTouchMoving.current = false;
        swipeProcessed.current = false;
        return;
      }
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX.current;
      const diffY = touchEndY - touchStartY.current;
      
      // Much higher thresholds to prevent accidental swipes
      const verticalThreshold = threshold * 4; // Increased from 2x to 4x
      const horizontalThreshold = threshold * 2; // Increased from 1.2x to 2x
      
      // Determine if the swipe was primarily horizontal or vertical
      const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY) * 1.5; // Require more dominance
      
      // Only process if we haven't already processed a swipe
      if (!swipeProcessed.current) {
        if (isHorizontalSwipe) {
          if (Math.abs(diffX) >= horizontalThreshold) {
            swipeProcessed.current = true;
            if (diffX > 0 && onSwipeRight) {
              // Swipe right -> previous song
              const swipeEvent = new CustomEvent('swipe-gesture', { 
                detail: { direction: 'right' } 
              });
              document.dispatchEvent(swipeEvent);
              onSwipeRight();
            } else if (diffX < 0 && onSwipeLeft) {
              // Swipe left -> next song
              const swipeEvent = new CustomEvent('swipe-gesture', { 
                detail: { direction: 'left' } 
              });
              document.dispatchEvent(swipeEvent);
              onSwipeLeft();
            }
          }
        } else {
          // For vertical swipes, require even more intentional gesture
          if (Math.abs(diffY) >= verticalThreshold) {
            swipeProcessed.current = true;
            if (diffY > 0 && onSwipeDown) {
              // Swipe down
              const swipeEvent = new CustomEvent('swipe-gesture', { 
                detail: { direction: 'down' } 
              });
              document.dispatchEvent(swipeEvent);
              onSwipeDown();
            } else if (diffY < 0 && onSwipeUp) {
              // Swipe up - make this even more restrictive
              // Only trigger if it's a very strong upward swipe
              if (Math.abs(diffY) >= verticalThreshold * 1.5) {
                const swipeEvent = new CustomEvent('swipe-gesture', { 
                  detail: { direction: 'up' } 
                });
                document.dispatchEvent(swipeEvent);
                onSwipeUp();
              }
            }
          }
        }
      }
      
      touchStartX.current = null;
      touchStartY.current = null;
      touchMoveCount.current = 0;
      isTouchMoving.current = false;
      swipeProcessed.current = false;
    };
    
    element.addEventListener('touchstart', handleTouchStart as any);
    element.addEventListener('touchmove', handleTouchMove as any);
    element.addEventListener('touchend', handleTouchEnd as any);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart as any);
      element.removeEventListener('touchmove', handleTouchMove as any);
      element.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [elementRef, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, isMobile]);
}
