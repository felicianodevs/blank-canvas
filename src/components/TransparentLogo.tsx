import { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/utils/removeBackground';
import logo from '@/assets/logo.png';

interface TransparentLogoProps {
  className?: string;
  alt?: string;
}

export const TransparentLogo = ({ className, alt = "Logo" }: TransparentLogoProps) => {
  const [transparentLogoUrl, setTransparentLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        const img = await loadImage(logo);
        const transparentUrl = await removeBackground(img);
        setTransparentLogoUrl(transparentUrl);
        setError(null);
      } catch (err) {
        console.error('Error processing logo:', err);
        setError('Failed to process logo');
        // Fallback to original logo if processing fails
        setTransparentLogoUrl(logo);
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, []);

  if (isProcessing) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-muted rounded-lg w-full h-full" />
      </div>
    );
  }

  if (error || !transparentLogoUrl) {
    return <img src={logo} alt={alt} className={className} />;
  }

  return <img src={transparentLogoUrl} alt={alt} className={className} />;
};
