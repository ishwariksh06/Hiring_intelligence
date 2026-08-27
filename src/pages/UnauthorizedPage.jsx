import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">403 &middot; Not authorized</h1>
      <p className="max-w-sm text-sm text-slate-500">
        You don&apos;t have permission to view this page. Try logging in with a different account.
      </p>
      <Link to="/login">
        <Button>Back to login</Button>
      </Link>
    </div>
  );
}
