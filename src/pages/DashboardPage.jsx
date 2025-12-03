import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, School, LogOut } from 'lucide-react';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // LocalStorage से डेटा निकालें
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login'); // अगर लॉगिन नहीं है तो वापस भेजो
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData'); // डेटा साफ़ करें
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-blue-600"></div>
          
          <div className="px-8 pb-8">
            {/* Profile Picture (Circle) */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full p-2 mx-auto md:mx-0">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-4xl font-bold text-gray-500">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-blue-600 font-medium">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="mt-4 md:mt-0 flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition">
                <LogOut size={18} /> Logout
              </button>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Mail size={24}/></div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
              </div>

              {/* अगर मेंटर है तो कॉलेज दिखाओ */}
              {user.role === 'Mentor' && (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><School size={24}/></div>
                    <div>
                      <p className="text-sm text-gray-500">College</p>
                      <p className="font-semibold text-gray-800">{user.college}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><BookOpen size={24}/></div>
                    <div>
                      <p className="text-sm text-gray-500">Expertise</p>
                      <p className="font-semibold text-gray-800">{user.expertise}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;