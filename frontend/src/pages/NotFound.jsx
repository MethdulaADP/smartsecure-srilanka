import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl mb-6 font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">404</div>
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
  <p className="text-slate-600 max-w-md mb-8">The page you're looking for doesn't exist or was moved. Try returning to the homepage.</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow">Go Home</Link>
    </div>
  );
}
