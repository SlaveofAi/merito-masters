
import { useState, useEffect } from 'react';

export const useQRCode = () => {
  const [showQRCode, setShowQRCode] = useState(false);

  const generateQRCode = async (url: string) => {
    try {
      // Dynamically import QRCode.js to avoid server-side rendering issues
      const QRCode = (await import('qrcode')).default;
      
      // Show QR code container
      setShowQRCode(true);
      
      // Wait for the DOM to update
      setTimeout(() => {
        const element = document.getElementById('qrcode');
        if (element) {
          element.innerHTML = '';
          QRCode.toCanvas(element, url, {
            width: 180,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          }, (error) => {
            if (error) console.error('Error generating QR code:', error);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Failed to load QRCode library:', error);
    }
  };

  // Close QR code when clicking outside
  useEffect(() => {
    if (showQRCode) {
      const handleClickOutside = (event: MouseEvent) => {
        const qrCodeElement = document.getElementById('qrcode')?.parentElement?.parentElement;
        if (qrCodeElement && !qrCodeElement.contains(event.target as Node)) {
          setShowQRCode(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showQRCode]);

  return {
    showQRCode,
    setShowQRCode,
    generateQRCode
  };
};
