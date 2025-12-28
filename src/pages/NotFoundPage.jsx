import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100">
                <h1 className="text-9xl font-extrabold text-gray-200 mb-4 select-none">404</h1>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-8">
                    Oops! The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200"
                    >
                        <Home size={20} /> Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                        <ArrowLeft size={20} /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
