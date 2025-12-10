import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // URL se ID nikalne ke liye
import { MapPin, BookOpen, User, Video } from 'lucide-react'; // Icons

function MentorProfile() {
  const { id } = useParams(); // URL se Mentor ki ID mil jayegi
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Backend se us Mentor ki poori details mangwana
    fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMentor(data.mentor);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center pt-20 text-xl font-bold">Loading Profile...</div>;
  if (!mentor) return <div className="text-center pt-20 text-red-500">Mentor not found!</div>;

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* --- MAIN PROFILE CARD --- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="h-32 bg-blue-600"></div> {/* Blue Background Header */}
            
            <div className="px-8 pb-8">
                <div className="relative flex justify-between items-end -mt-12 mb-6">
                    <img 
                      src={mentor.image || `https://ui-avatars.com/api/?name=${mentor.username}&background=0D8ABC&color=fff&size=200`} 
                      className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                      alt={mentor.username}
                    />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{mentor.username}</h1>
                <p className="text-blue-600 font-medium text-lg mb-4">{mentor.role === 'mentor' ? 'Verified Mentor ✅' : 'Student'}</p>

                {/* --- DETAILS SECTION (Jo aapne manga tha) --- */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    
                    {/* College Detail */}
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">College / University</p>
                            <p className="text-gray-900 font-semibold">{mentor.college || "Not Added"}</p>
                        </div>
                    </div>

                    {/* Expertise / Branch Detail */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="bg-green-600 p-2 rounded-lg text-white">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Expertise / Branch</p>
                            <p className="text-gray-900 font-semibold">{mentor.branch || "General Guidance"}</p>
                        </div>
                    </div>

                </div>

                {/* Bio / About Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">About Me</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {mentor.about || `Hello! I am ${mentor.username}. I am currently studying at ${mentor.college} in the ${mentor.branch} department. I can help you with career guidance and exam preparation.`}
                    </p>
                </div>
            </div>
        </div>

        {/* --- LECTURES SECTION (Agar Mentor ne video dale hain) --- */}
        {/* Iske liye alag API call lagegi agar aapne Lecture model banaya hai */}
        
      </div>
    </div>
  );
}

export default MentorProfile;