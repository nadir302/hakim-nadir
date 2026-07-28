import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ServerError() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
          <AlertTriangle className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">500</h1>
        <h2 className="mb-2 text-xl font-bold">Server error</h2>
        <p className="mb-6 text-muted-foreground">Something went wrong on our end. Please try again later.</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
          <Button asChild>
            <Link to="/dashboard"><Home className="mr-2 h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
