import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Award, ChevronDown, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function HomePage() {
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate();

  // 1. Fetch Mentors Data
  useEffect(() => {
    fetch('https://navigreat-backend-98.onrender.com/api/mentors')
      .then(response => response.json())
      .then(data => setMentors(data))
      .catch(error => console.error('Error fetching mentors:', error));
  }, []);

  // 2. Book Session Logic
  const handleBookSession = async (mentorName) => {
    const userData = localStorage.getItem('userData'); 
    
    // Check Login
    if (!userData) {
      toast.error("🔒 Please Login first!");
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    const loadingToast = toast.loading("Booking session...");

    try {
      const response = await fetch('https://navigreat-backend-98.onrender.com/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            studentEmail: user.email, 
            mentorName: mentorName 
        }),
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(`Session booked with ${mentorName}!`);
      } else {
        toast.error("Booking Failed.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server Error!");
    }
  };

  return (
    <div className="pt-16">
      
      {/* 1. HERO SECTION */}
      <section className="bg-blue-600 text-white py-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Learn, Grow & Get Guided by the Best Minds
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Connect with mentors from IITs, NITs, and top global universities. 
              Get career clarity, build skills, and achieve your goals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/mentors" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition text-center">
                Find a Mentor
              </Link>
              <Link to="/become-mentor" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition text-center">
                Become a Mentor
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Mentorship Team" 
              className="rounded-xl shadow-2xl w-full max-w-md transform md:rotate-3 hover:rotate-0 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-16 bg-white relative z-10 -mt-10 container mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Trusted by Top Institutions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">23</span><span className="text-gray-600 font-medium">IITs</span></div>
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">31</span><span className="text-gray-600 font-medium">NITs</span></div>
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">25</span><span className="text-gray-600 font-medium">IIITs</span></div>
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">15+</span><span className="text-gray-600 font-medium">Global Unis</span></div>
          </div>
        </div>
      </section>

      {/* 3. EXPERT MENTORS SECTION */}
      <section id="mentors" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Expert Mentors</h2>
            <p className="text-gray-600 mt-4 text-lg">Learn from the best minds (Data fetched from Backend)</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {mentors.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p className="text-xl text-gray-500 animate-pulse">Loading Mentors...</p>
              </div>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group">
                  <div className="relative">
                    <img src={mentor.image} className="w-full h-56 object-cover" alt={mentor.name}/>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800">{mentor.name}</h3>
                    <p className="text-blue-600 font-medium mb-1">{mentor.college}</p>
                    <p className="text-gray-500 text-sm mb-4">{mentor.role}</p>
                    
                    <button 
                      onClick={() => handleBookSession(mentor.name)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition active:scale-95"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/mentors" className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                View All Mentors
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">FAQ</h2>
          </div>
          <div className="space-y-4">
            {["How do I find the right mentor?", "What is the cost?", "Are mentors verified?", "Can I become a mentor?"].map((q, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-blue-400 cursor-pointer transition bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-gray-800">{q}</span>
                  <ChevronDown className="text-gray-400"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;