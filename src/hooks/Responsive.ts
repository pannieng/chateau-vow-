// /**
//  * Responsive Design Utilities
//  * Custom hooks and helpers for managing responsive behavior
//  */

// import { useState, useEffect, useCallback, useMemo } from 'react';

// // =====================
// // CONSTANTS
// // =====================

// export const BREAKPOINTS = {
//   MOBILE: 768,
//   TABLET: 1024,
//   DESKTOP: 1440,
//   WIDE: 1920,
// } as const;

// export type DeviceType = 'mobile' | 'tablet' | 'desktop';
// export type Orientation = 'portrait' | 'landscape';

// // =====================
// // HOOKS
// // =====================

// /**
//  * useViewport - Get current viewport dimensions
//  * Returns width, height, and updates on resize
//  */
// export const useViewport = () => {
//   const [viewport, setViewport] = useState({
//     width: typeof window !== 'undefined' ? window.innerWidth : 0,
//     height: typeof window !== 'undefined' ? window.innerHeight : 0,
//   });

//   useEffect(() => {
//     let timeoutId: NodeJS.Timeout;

//     const handleResize = () => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(() => {
//         setViewport({
//           width: window.innerWidth,
//           height: window.innerHeight,
//         });
//       }, 150); // Debounce 150ms
//     };

//     window.addEventListener('resize', handleResize);
//     window.addEventListener('orientationchange', handleResize);

//     return () => {
//       clearTimeout(timeoutId);
//       window.removeEventListener('resize', handleResize);
//       window.removeEventListener('orientationchange', handleResize);
//     };
//   }, []);

//   return viewport;
// };

// /**
//  * useDeviceType - Determine current device type based on viewport width
//  */
// export const useDeviceType = (): DeviceType => {
//   const { width } = useViewport();

//   return useMemo(() => {
//     if (width <= BREAKPOINTS.MOBILE) return 'mobile';
//     if (width <= BREAKPOINTS.TABLET) return 'tablet';
//     return 'desktop';
//   }, [width]);
// };

// /**
//  * useOrientation - Get current device orientation
//  */
// export const useOrientation = (): Orientation => {
//   const { width, height } = useViewport();
  
//   return useMemo(() => {
//     return width > height ? 'landscape' : 'portrait';
//   }, [width, height]);
// };

// /**
//  * useMediaQuery - Check if a media query matches
//  * Example: const isMobile = useMediaQuery('(max-width: 768px)');
//  */
// export const useMediaQuery = (query: string): boolean => {
//   const [matches, setMatches] = useState(false);

//   useEffect(() => {
//     const mediaQuery = window.matchMedia(query);
//     setMatches(mediaQuery.matches);

//     const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
//     // Modern browsers
//     if (mediaQuery.addEventListener) {
//       mediaQuery.addEventListener('change', handler);
//       return () => mediaQuery.removeEventListener('change', handler);
//     } else {
//       // Fallback for older browsers
//       mediaQuery.addListener(handler);
//       return () => mediaQuery.removeListener(handler);
//     }
//   }, [query]);

//   return matches;
// };

// /**
//  * useResponsive - All-in-one responsive hook
//  * Returns device type, orientation, and boolean checks
//  */
// export const useResponsive = () => {
//   const deviceType = useDeviceType();
//   const orientation = useOrientation();
//   const { width, height } = useViewport();

//   return {
//     // Device type
//     deviceType,
//     isMobile: deviceType === 'mobile',
//     isTablet: deviceType === 'tablet',
//     isDesktop: deviceType === 'desktop',
    
//     // Orientation
//     orientation,
//     isPortrait: orientation === 'portrait',
//     isLandscape: orientation === 'landscape',
    
//     // Dimensions
//     width,
//     height,
    
//     // Breakpoint checks
//     isMobileOrSmaller: width <= BREAKPOINTS.MOBILE,
//     isTabletOrSmaller: width <= BREAKPOINTS.TABLET,
//     isDesktopOrLarger: width > BREAKPOINTS.TABLET,
//   };
// };

// /**
//  * useTouchDevice - Detect if device supports touch
//  */
// export const useTouchDevice = (): boolean => {
//   const [isTouch, setIsTouch] = useState(false);

//   useEffect(() => {
//     setIsTouch(
//       'ontouchstart' in window ||
//       navigator.maxTouchPoints > 0
//     );
//   }, []);

//   return isTouch;
// };

// /**
//  * useReducedMotion - Check if user prefers reduced motion
//  */
// export const useReducedMotion = (): boolean => {
//   return useMediaQuery('(prefers-reduced-motion: reduce)');
// };

// /**
//  * usePrefersColorScheme - Get user's color scheme preference
//  */
// export const usePrefersColorScheme = (): 'light' | 'dark' | 'no-preference' => {
//   const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
//   const prefersLight = useMediaQuery('(prefers-color-scheme: light)');

//   if (prefersDark) return 'dark';
//   if (prefersLight) return 'light';
//   return 'no-preference';
// };

// // =====================
// // UTILITY FUNCTIONS
// // =====================

// /**
//  * getDeviceType - Synchronous function to get device type from width
//  */
// export const getDeviceType = (width: number): DeviceType => {
//   if (width <= BREAKPOINTS.MOBILE) return 'mobile';
//   if (width <= BREAKPOINTS.TABLET) return 'tablet';
//   return 'desktop';
// };

// /**
//  * clamp - Clamp a value between min and max
//  */
// export const clamp = (value: number, min: number, max: number): number => {
//   return Math.min(Math.max(value, min), max);
// };

// /**
//  * getResponsiveValue - Get value based on current device type
//  * Example: getResponsiveValue(deviceType, { mobile: 12, tablet: 16, desktop: 20 })
//  */
// export const getResponsiveValue = <T,>(
//   deviceType: DeviceType,
//   values: { mobile: T; tablet: T; desktop: T }
// ): T => {
//   return values[deviceType];
// };

// /**
//  * isMobileDevice - User agent check for mobile devices
//  * Note: Not always reliable, prefer CSS/viewport checks
//  */
// export const isMobileDevice = (): boolean => {
//   if (typeof navigator === 'undefined') return false;
  
//   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//     navigator.userAgent
//   );
// };

// /**
//  * hasNotch - Detect if device has a notch/safe area
//  */
// export const hasNotch = (): boolean => {
//   if (typeof window === 'undefined') return false;
  
//   // Check if CSS safe area insets are supported
//   const div = document.createElement('div');
//   div.style.paddingTop = 'env(safe-area-inset-top)';
//   document.body.appendChild(div);
//   const hasSafeArea = div.style.paddingTop !== '';
//   document.body.removeChild(div);
  
//   return hasSafeArea;
// };

// // =====================
// // RESPONSIVE CLASSES
// // =====================

// /**
//  * getResponsiveClasses - Generate responsive class names
//  */
// export const getResponsiveClasses = (
//   deviceType: DeviceType,
//   baseClass: string
// ): string => {
//   const classes = [baseClass];
  
//   switch (deviceType) {
//     case 'mobile':
//       classes.push(`${baseClass}--mobile`, 'mobile-view');
//       break;
//     case 'tablet':
//       classes.push(`${baseClass}--tablet`, 'tablet-view');
//       break;
//     case 'desktop':
//       classes.push(`${baseClass}--desktop`, 'desktop-view');
//       break;
//   }
  
//   return classes.join(' ');
// };

// // =====================
// // PERFORMANCE HELPERS
// // =====================

// /**
//  * debounce - Debounce function calls
//  */
// export const debounce = <T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): ((...args: Parameters<T>) => void) => {
//   let timeoutId: NodeJS.Timeout;
  
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(...args), wait);
//   };
// };

// /**
//  * throttle - Throttle function calls
//  */
// export const throttle = <T extends (...args: any[]) => any>(
//   func: T,
//   limit: number
// ): ((...args: Parameters<T>) => void) => {
//   let inThrottle: boolean;
  
//   return (...args: Parameters<T>) => {
//     if (!inThrottle) {
//       func(...args);
//       inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// };

// // =====================
// // EXAMPLES
// // =====================

// /*
// EXAMPLE USAGE:

// // 1. Basic responsive hook
// const { isMobile, isTablet, isDesktop } = useResponsive();

// // 2. Get viewport dimensions
// const { width, height } = useViewport();

// // 3. Check orientation
// const orientation = useOrientation();
// const isLandscape = orientation === 'landscape';

// // 4. Media query
// const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

// // 5. Responsive value
// const fontSize = getResponsiveValue(deviceType, {
//   mobile: 14,
//   tablet: 16,
//   desktop: 18
// });

// // 6. Touch device
// const isTouch = useTouchDevice();

// // 7. Reduced motion
// const prefersReducedMotion = useReducedMotion();

// // 8. Complete example in component
// import { useResponsive, getResponsiveValue } from './utils/responsive';

// const MyComponent = () => {
//   const { deviceType, isMobile, orientation } = useResponsive();
  
//   const padding = getResponsiveValue(deviceType, {
//     mobile: '20px',
//     tablet: '40px',
//     desktop: '60px'
//   });
  
//   return (
//     <div 
//       className={`component ${deviceType}-view`}
//       style={{ padding }}
//     >
//       {isMobile && <MobileLayout />}
//       {!isMobile && <DesktopLayout />}
//     </div>
//   );
// };
// */