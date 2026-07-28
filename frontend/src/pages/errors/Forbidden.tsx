import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">403</h1>
        <h2 className="mb-2 text-xl font-bold">Access denied</h2>
        <p className="mb-6 text-muted-foreground">You don't have permission to access this page.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
