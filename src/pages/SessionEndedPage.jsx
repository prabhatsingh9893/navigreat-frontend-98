import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const SessionEndedPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const storedSession = sessionStorage.getItem('currentSession');

        if (!storedSession) {
            // No active session found, go to dashboard
            navigate('/dashboard');
            return;
        }

        const sessionData = JSON.parse(storedSession);

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const rejoinTimeout = setTimeout(() => {
            // Navigate back to LiveSession with the saved state
            navigate('/session', { state: sessionData });
        }, 3000); // 3 seconds delay

        return () => {
            clearInterval(timer);
            clearTimeout(rejoinTimeout);
        };
    }, [navigate]);

    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white space-y-6">
            <Loader text="" />
            <h1 className="text-2xl font-bold">Session Ended</h1>
            <p className="text-gray-400">Rejoining in {countdown} seconds...</p>

            <button
                onClick={() => {
                    sessionStorage.removeItem('currentSession');
                    navigate('/dashboard?meeting_ended=true');
                }}
                className="px-6 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition text-sm font-bold border border-gray-600"
            >
                Cancel & Return to Dashboard
            </button>
        </div>
    );
};

export default SessionEndedPage;
