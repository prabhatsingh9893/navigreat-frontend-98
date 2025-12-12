import React, { useEffect, useState } from 'react';
import { MapPin, BookOpen } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 

// 👇 1. IMPORT FAQ SECTION
import FAQSection from '../components/FAQSection'; 

function HomePage() {
  const [mentors, setMentors] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- 1. FETCH MENTORS ---
  useEffect(() => {
    fetch('https://navigreat-backend-98.onrender.com/api/mentors')
      .then(response => response.json())
      .then(data => {
        if (data.success && Array.isArray(data.mentors)) {
          setMentors(data.mentors);
        } else if (Array.isArray(data)) {
          setMentors(data);
        } else {
          setMentors([]); 
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching mentors:', error);
        setMentors([]);
        setLoading(false);
      });
  }, []);

  // --- 2. BOOK SESSION ---
  const handleBookSession = async (mentorName) => {
    const userData = localStorage.getItem('userData'); 
    
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
        toast.error(result.message || "Booking Failed.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server Error!");
    }
  };

  // --- 3. SKELETON LOADER ---
  const MentorSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

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
            <p className="text-gray-600 mt-4 text-lg">Learn from the best minds</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((n) => <MentorSkeleton key={n} />)
            ) : (!mentors || mentors.length === 0) ? (
              <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No mentors available at the moment. 😕</p>
              </div>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor._id || mentor.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group border border-gray-100 flex flex-col">
                  
                  {/* Image Area */}
                  <div className="relative h-56 bg-blue-50 overflow-hidden">
                    <img 
                      src={mentor.image || `https://ui-avatars.com/api/?name=${mentor.username || "User"}&background=0D8ABC&color=fff`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      alt={mentor.username || "Mentor"}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=Mentor"; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-white font-bold text-xl truncate">{mentor.username || mentor.name}</h3>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                          <MapPin size={18} />
                          <span className="truncate">{mentor.college || "Unknown College"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                        <BookOpen size={18} />
                        <span className="truncate">{mentor.role || mentor.branch || "Mentor"}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleBookSession(mentor.username || mentor.name)}
                      className="mt-auto w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 active:scale-95"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/mentors" className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition inline-block">
                View All Mentors
            </Link>
          </div>
        </div>
      </section>

      {/* 4. ✅ ACTIVE FAQ SECTION ADDED HERE */}
      <FAQSection />

    </div>
  );
}

export default HomePage;