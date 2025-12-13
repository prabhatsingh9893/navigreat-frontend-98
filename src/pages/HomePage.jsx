import React, { useEffect, useState } from 'react';
// Star icon hata diya kyunki ab use nahi ho raha
import { BookOpen, CheckCircle, ArrowRight, Sparkles, Users, Award } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import FAQSection from '../components/FAQSection'; 

// --- ANIMATED COUNTER ---
const Counter = ({ end, duration }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); 
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); } 
      else { setCount(Math.ceil(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
};

function HomePage() {
  const [mentors, setMentors] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [text, setText] = useState("Dream Job");
  const words = ["Dream Job", "Top IITs", "Global Unis", "Success"];

  // Typewriter Effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(words[i]);
      i = (i + 1) % words.length;
    }, 2500); 
    return () => clearInterval(interval);
  }, []);

  // Fetch Mentors
  useEffect(() => {
    fetch('https://navigreat-backend-98.onrender.com/api/mentors')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mentors)) setMentors(data.mentors);
        else setMentors([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBookSession = async (mentorName) => {
    const userData = localStorage.getItem('userData'); 
    if (!userData) { toast.error("🔒 Please Login first!"); navigate('/login'); return; }
    const user = JSON.parse(userData);
    const loadingToast = toast.loading("Booking session...");
    try {
      await fetch('https://navigreat-backend-98.onrender.com/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: user.email, mentorName }),
      });
      toast.dismiss(loadingToast);
      toast.success(`Session booked with ${mentorName}!`);
    } catch { toast.dismiss(loadingToast); toast.error("Server Error!"); }
  };

  return (
    <div className="pt-16 font-sans bg-white">
      
      {/* 1. HERO SECTION (Light & Gradient) */}
      <section className="relative bg-gradient-to-b from-blue-50 via-white to-white pt-20 pb-32 overflow-hidden">
        
        {/* Colorful Blobs (Background Decorations) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-30 translate-y-1/3 -translate-x-1/4"></div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200 shadow-sm">
              <Sparkles size={16} /> <span>#1 Mentorship Platform for Engineers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {text}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
              Stop guessing your career path. Connect with seniors from IITs & NITs who have already walked the road.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/mentors" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Find a Mentor <ArrowRight size={20} />
              </Link>
              <Link to="/become-mentor" className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition shadow-sm">
                Become a Mentor
              </Link>
            </div>
          </div>

          {/* Hero Image with ONLY Verified Badge */}
          <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
            <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Happy Students" 
                  className="rounded-3xl shadow-2xl border-4 border-white w-full max-w-md relative z-10"
                />
                
                {/* ✅ Floating Badge 1 (Verified) - Still Here */}
                <div className="absolute -left-8 top-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20 animate-bounce delay-100">
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24}/></div>
                    <div><p className="font-bold text-gray-800">Verified</p><p className="text-xs text-gray-500">Mentors</p></div>
                </div>

                {/* ❌ Floating Badge 2 (Rating) - REMOVED from here */}
            </div>
          </div>
        </div>
      </section>

      {/* 2. COLORFUL STATS SECTION */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { label: "IITs Covered", val: 23, color: "bg-blue-50 text-blue-600", icon: <Award /> },
                { label: "NITs Covered", val: 31, color: "bg-purple-50 text-purple-600", icon: <Award /> },
                { label: "Active Mentors", val: 50, color: "bg-green-50 text-green-600", icon: <Users /> },
                { label: "Happy Students", val: 500, color: "bg-orange-50 text-orange-600", icon: <Users /> },
            ].map((stat, idx) => (
                <div key={idx} className={`${stat.color} p-8 rounded-3xl text-center transition hover:scale-105 cursor-default`}>
                    <div className="flex justify-center mb-3 opacity-80">{stat.icon}</div>
                    <h3 className="text-4xl font-extrabold mb-1"><Counter end={stat.val} duration={2000} />+</h3>
                    <p className="font-semibold opacity-70 uppercase text-sm tracking-wide">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* 3. MENTORS SECTION (Clean & Soft) */}
      <section id="mentors" className="py-24 bg-gradient-to-b from-white to-blue-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Expert Guidance</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2">Meet Your Future Mentors</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {loading ? ( [1, 2, 3].map((n) => <div key={n} className="h-80 bg-gray-100 rounded-3xl animate-pulse"></div>) ) : 
            (!mentors || mentors.length === 0) ? ( <div className="col-span-3 text-center text-gray-500">No mentors found.</div> ) : (
              mentors.map((mentor) => (
                <div key={mentor._id} className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col">
                  {/* Image */}
                  <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={mentor.image || `https://ui-avatars.com/api/?name=${mentor.username}&background=random`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                      alt={mentor.username}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=Mentor"; }}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                      <CheckCircle size={12} className="text-blue-500" /> Verified
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-2 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{mentor.username}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-1 truncate">{mentor.college || "Top University"}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 bg-gray-50 p-2 rounded-lg mt-2">
                        <BookOpen size={16} /> <span className="truncate">{mentor.branch || "Engineering"}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleBookSession(mentor.username)}
                      className="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-200 active:scale-95"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-16">
            <Link to="/mentors" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm">
                View All Mentors <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION (Already Updated) */}
      <FAQSection />

    </div>
  );
}

export default HomePage;