import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (token) {
      supabase.auth.verifyOtp({ tokenHash: token, type: 'signup' })
        .then(({ error }) => {
          setStatus(error ? 'error' : 'success');
        })
        .catch(() => setStatus('error'));
    }
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <div>
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold">Verifying your email...</h2>
        </div>
      )}
      {status === 'success' && (
        <div>
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold">Email verified!</h2>
          <p className="mt-2 text-sm text-muted-foreground">You can now sign in.</p>
          <Link to="/login" className="mt-4 inline-block text-primary hover:underline">Go to login</Link>
        </div>
      )}
      {status === 'error' && (
        <div>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Verification failed</h2>
          <p className="mt-2 text-sm text-muted-foreground">The link may be expired or invalid.</p>
          <Link to="/login" className="mt-4 inline-block text-primary hover:underline">Go to login</Link>
        </div>
      )}
    </div>
  );
}
