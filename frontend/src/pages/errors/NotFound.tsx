import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-8xl font-bold text-primary/20">404</h1>
        <h2 className="mb-2 text-2xl font-bold">Page not found</h2>
        <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Go back</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard"><Home className="mr-2 h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
