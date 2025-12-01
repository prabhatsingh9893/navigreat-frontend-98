import React, { useEffect, useState } from 'react'; // <--- 1. We imported Hooks
import { Users, BookOpen, Award, ChevronDown } from 'lucide-react';

function HomePage() {
  // --- 2. State to hold the data coming from the Backend ---
  const [mentors, setMentors] = useState([]);

  // --- 3. The Bridge: Fetch data from localhost:5000 ---
  useEffect(() => {
    fetch('http://localhost:5000/api/mentors')
      .then(response => response.json())
      .then(data => {
        console.log("Data received from backend:", data); // Check console to see data
        setMentors(data);
      })
      .catch(error => console.error('Error fetching mentors:', error));
  }, []);

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
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                Find a Mentor
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition">
                Become a Mentor
              </button>
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
          <p className="text-gray-600 mb-10">Partnering with India's premier engineering institutes</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">23</span><span className="text-gray-600 font-medium">IITs</span></div>
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">31</span><span className="text-gray-600 font-medium">NITs</span></div>
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">25</span><span className="text-gray-600 font-medium">IIITs</span></div>
            <div className="p-4"><span className="block text-5xl font-bold text-blue-600 mb-2">15+</span><span className="text-gray-600 font-medium">Global Unis</span></div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About Us</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">We bridge the gap between ambition and achievement.</p>
            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="mt-1 bg-blue-100 p-3 rounded-full h-fit"><Award className="text-blue-600" size={24}/></div>
                <div><h4 className="font-bold text-xl text-gray-900 mb-2">Our Mission</h4><p className="text-gray-600">Empower students with career clarity.</p></div>
              </div>
              <div className="flex gap-5">
                <div className="mt-1 bg-blue-100 p-3 rounded-full h-fit"><Users className="text-blue-600" size={24}/></div>
                <div><h4 className="font-bold text-xl text-gray-900 mb-2">Our Impact</h4><p className="text-gray-600">1000+ students guided.</p></div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4 relative">
             <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=500&q=80" className="rounded-2xl shadow-lg object-cover h-64 w-full" alt="Student"/>
             <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80" className="rounded-2xl shadow-lg object-cover h-80 w-full mt-12" alt="Library"/>
          </div>
        </div>
      </section>

      {/* 4. EXPERT MENTORS SECTION (NOW DYNAMIC) */}
      <section id="mentors" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Expert Mentors</h2>
            <p className="text-gray-600 mt-4 text-lg">Learn from the best minds (Data fetched from Backend)</p>
          </div>
          
          {/* This Grid is now powered by the Backend Data */}
          <div className="grid md:grid-cols-3 gap-8">
            {mentors.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p className="text-xl text-gray-500 animate-pulse">Loading Mentors from Server...</p>
              </div>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
                  <img src={mentor.image} className="w-full h-56 object-cover" alt={mentor.name}/>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800">{mentor.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{mentor.college} • {mentor.role}</p>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">Book Session</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <button className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">View All Mentors</button>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
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