import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reservationsApi, tripsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, CameraOff, Loader2, ScanLine } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

type PageState = 'idle' | 'starting-camera' | 'scanning' | 'validating' | 'success' | 'error' | 'camera-error';

export default function ScanQr() {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [result, setResult] = useState<any>(null);
  const [cameraError, setCameraError] = useState('');

  const { data: trip } = useQuery({
    queryKey: ['driver-current-trip'],
    queryFn: () => tripsApi.getAll({ limit: 1, status: 'IN_PROGRESS' }).then(r => r.data?.data?.[0]),
  });

  const showSuccess = (data: any) => { setResult(data); setPageState('success'); setTimeout(() => { if (mountedRef.current) navigate('/driver/tracking'); }, 2000); };
  const showError = (msg: string) => { setPageState('error'); setResult(null); setTimeout(() => { if (mountedRef.current) scanStart(); }, 2000); };

  const validateToken = async (token: string) => {
    setPageState('validating');
    try {
      const res = await reservationsApi.validateQR(token, { driverId: trip?.id });
      if (res.data.status === 'VALID') showSuccess(res.data);
      else showError(res.data.message || 'Invalid QR code');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Validation failed');
    }
  };

  const scanStart = async () => {
    if (!mountedRef.current) return;
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setPageState('starting-camera');
  };

  const scanStop = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; scanStop(); };
  }, []);

  useEffect(() => {
    if (pageState !== 'starting-camera') return;
    const start = async () => {
      if (!mountedRef.current) return;
      if (!window.isSecureContext) {
        setCameraError('Camera requires HTTPS. Access via https:// or localhost only.');
        setPageState('camera-error');
        return;
      }
      let devices: MediaDeviceInfo[] = [];
      try { devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput'); } catch {}
      if (devices.length === 0) {
        setCameraError('No camera detected on this device. Check your camera hardware and drivers.');
        setPageState('camera-error');
        return;
      }
      let perm: PermissionStatus | null = null;
      try { perm = await navigator.permissions.query({ name: 'camera' as PermissionName }); } catch {}
      if (perm?.state === 'denied') {
        setCameraError('Camera blocked in browser. Open chrome://settings/content/camera, remove localhost from "Block" list, then reload.');
        setPageState('camera-error');
        return;
      }
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        testStream.getTracks().forEach(t => t.stop());
      } catch (e: any) {
        const msg = (e?.message || e?.toString() || '').toLowerCase();
        if (msg.includes('permission') || msg.includes('notallowederror')) {
          setCameraError('Camera permission denied by browser or system. In Windows: Settings → Privacy & security → Camera → ensure "Camera access" is ON for this browser.');
        } else if (msg.includes('notfound') || msg.includes('devicenotfound')) {
          setCameraError('Camera device not found. Check if another app (Zoom, Teams) is using it, or restart your computer.');
        } else if (msg.includes('inuse') || msg.includes('notreadable') || msg.includes('trackstarterror')) {
          setCameraError('Camera is busy. Close other apps using the camera (Zoom, Discord, OBS) and try again.');
        } else {
          setCameraError(`Camera error: ${e?.message || e?.toString() || 'Unknown error'}`);
        }
        setPageState('camera-error');
        return;
      }
      const scanner = new Html5Qrcode('qr-reader-container');
      scannerRef.current = scanner;
      const config = { fps: 10, qrbox: { width: 260, height: 260 } };
      const onScan = (decodedText: string) => {
        if (!mountedRef.current) return;
        scanner.stop().catch(() => {});
        validateToken(decodedText);
      };
      let lastErr = '';
      for (const facing of ['environment', 'user'] as const) {
        try {
          await scanner.start({ facingMode: facing }, config, onScan, () => {});
          if (mountedRef.current) setPageState('scanning');
          return;
        } catch (e: any) { lastErr = e?.message || e?.toString() || 'Unknown error'; }
      }
      if (!mountedRef.current) return;
      if (lastErr.toLowerCase().includes('permission') || lastErr.toLowerCase().includes('notallowederror')) {
        setCameraError('Camera permission blocked. Please allow camera access in your browser settings and try again.');
      } else {
        setCameraError(`Camera error: ${lastErr}`);
      }
      setPageState('camera-error');
    };
    start();
  }, [pageState]);

  const goBack = () => { scanStop(); navigate('/driver/tracking'); };

  if (pageState === 'idle') {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">Scan QR Code</h1>
            <p className="text-xs text-white/60">Scan passenger QR codes for check-in</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          <div className="rounded-full border-4 border-white/20 p-8">
            <ScanLine className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-white">Ready to scan</p>
            <p className="mt-1 text-sm text-white/50">Click the button below to start the camera</p>
          </div>
          <Button size="lg" className="w-full max-w-xs gap-2 text-base" onClick={scanStart}>
            <ScanLine className="h-5 w-5" /> Start Scanning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center gap-3 p-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={goBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-white">Scan QR Code</h1>
          <p className="text-xs text-white/60">Point the camera at the QR code</p>
        </div>
      </div>

      {(pageState === 'starting-camera' || pageState === 'scanning' || pageState === 'validating' || pageState === 'error') && (
        <div className="absolute inset-0 z-0 flex items-center justify-center" style={{ top: 72, bottom: 120 }}>
          <div id="qr-reader-container" className="h-full w-full max-w-lg" />
        </div>
      )}

      {pageState === 'scanning' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" style={{ top: 72, bottom: 120 }}>
          <div className="relative">
            <div className="h-64 w-64 rounded-2xl border-2 border-white/30" />
            <div className="absolute -top-0.5 -left-0.5 h-9 w-9 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-9 w-9 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
            <div className="absolute -bottom-0.5 -left-0.5 h-9 w-9 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-0.5 -right-0.5 h-9 w-9 rounded-br-2xl border-b-4 border-r-4 border-primary" />
            <div className="absolute left-1 right-1 h-0.5 animate-scan bg-primary shadow-[0_0_10px_3px_rgba(59,130,246,0.5)]" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <div className="mx-auto max-w-sm text-center space-y-4">
          {pageState === 'starting-camera' && (
            <div className="flex items-center justify-center gap-2 text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Starting camera...</span>
            </div>
          )}
          {pageState === 'scanning' && (
            <>
              <p className="text-sm text-white/50">Waiting for QR code...</p>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={goBack}>Stop Scanning</Button>
            </>
          )}
          {pageState === 'validating' && (
            <div className="flex items-center justify-center gap-2 text-yellow-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Validating...</span>
            </div>
          )}
          {pageState === 'success' && (
            <div className="animate-bounce-in rounded-2xl border border-green-400/40 bg-green-500/20 p-5 backdrop-blur-md">
              <CheckCircle2 className="mx-auto mb-2 h-14 w-14 text-green-400" />
              <p className="text-lg font-bold text-green-300">Check-in Successful!</p>
              <p className="mt-3 text-xs text-green-300/50">Returning to tracking...</p>
            </div>
          )}
          {pageState === 'error' && (
            <div className="animate-shake rounded-2xl border border-red-400/40 bg-red-500/20 p-5 backdrop-blur-md">
              <XCircle className="mx-auto mb-2 h-12 w-12 text-red-400" />
              <p className="text-base font-semibold text-red-300">Invalid QR code</p>
              <p className="mt-2 text-xs text-red-300/50">Restarting scanner...</p>
            </div>
          )}
          {pageState === 'camera-error' && (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/20 p-5 backdrop-blur-md">
              <CameraOff className="mx-auto mb-2 h-10 w-10 text-red-400" />
              <p className="text-sm font-semibold text-red-300">{cameraError}</p>
              <p className="mt-2 text-xs text-white/50">Make sure no other app is using the camera. In Chrome/Edge: click the lock icon next to the URL, find "Camera" and set to "Allow", then reload the page.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={scanStart}>Try Again</Button>
                <Button variant="ghost" className="text-white/60 hover:text-white" onClick={goBack}>Back</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan { 0%,100% { top: 0.25rem; } 50% { top: calc(100% - 0.5rem); } }
        .animate-scan { animation: scan 2s ease-in-out infinite; }
        @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.35s ease-in-out; }
        #qr-reader-container video { object-fit: cover !important; }
      `}</style>
    </div>
  );
}
