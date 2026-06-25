import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role === 'student') {
        navigate('/dashboard/student', { replace: true });
      } else if (user.role === 'mentor') {
        navigate('/dashboard/mentor', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (e) {
      console.error("Error parsing user data in dashboard redirect:", e);
      localStorage.removeItem('userData');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#080d14]">
      <Loader text="Loading your dashboard..." />
    </div>
  );
};

export default DashboardPage;