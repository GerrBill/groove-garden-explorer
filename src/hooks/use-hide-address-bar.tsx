
import { useEffect } from 'react';

export function useHideAddressBar() {
  useEffect(() => {
    // Function to hide the address bar
    const hideAddressBar = () => {
      // If loaded on a mobile device
      if (window.navigator.userAgent.match(/Mobile|Android|iPhone|iPad|iPod/i)) {
        // Wait for everything to load
        setTimeout(() => {
          // For iOS Safari
          if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            // iOS Safari requires full screen height and then scroll
            const height = window.outerHeight;
            window.scrollTo(0, 1);
            
            // Add resize listener for orientation changes
            const handleResize = () => {
              // Need a small delay after resize event
              setTimeout(() => {
                window.scrollTo(0, 1);
              }, 100);
            };
            
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
          } 
          // For Chrome and other browsers
          else {
            window.scrollTo(0, 1);
            
            // Some Android browsers may need this
            document.body.style.height = "calc(100% + 1px)";
            
            // Reset after scroll is complete
            setTimeout(() => {
              document.body.style.height = "100%";
            }, 100);
          }
        }, 300);
      }
    };

    // Hide address bar on page load
    hideAddressBar();
    
    // Re-hide when coming back to the page
    window.addEventListener('pageshow', hideAddressBar);
    
    // Clean up
    return () => {
      window.removeEventListener('pageshow', hideAddressBar);
    };
  }, []);
}
