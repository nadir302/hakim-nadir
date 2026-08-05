import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface SafeQRCodeProps {
  value: string;
  size?: number;
}

export default function SafeQRCode({ value, size = 200 }: SafeQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, { width: size, errorCorrectionLevel: 'M', margin: 2 })
    }
  }, [value, size]);

  return <canvas ref={canvasRef} />;
}