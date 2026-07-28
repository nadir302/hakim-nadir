import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full sm:max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Smart Shuttle</h1>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-12">
        <div className="max-w-md text-white">
          <h2 className="mb-6 text-4xl font-bold">Smart Shuttle Management</h2>
          <p className="mb-8 text-lg opacity-90">
            Enterprise-grade transportation management system for cultural and public events.
            Optimize routes, track in real-time, and deliver exceptional experience.
          </p>
          <div className="space-y-4">
            {['Real-time GPS Tracking', 'Smart Route Optimization', 'QR Code Ticketing', 'Instant Notifications'].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
