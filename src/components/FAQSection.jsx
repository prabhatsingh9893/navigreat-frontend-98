import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'; // 👉 Icons changed here

const faqs = [
  {
    question: "What is EduMentor?",
    answer: "EduMentor is a platform that connects college students with mentors from top universities like IITs and NITs. You can get career guidance, coding help, and placement tips directly from seniors."
  },
  {
    question: "Is it free to book a session?",
    answer: "Yes! Registration on our platform is completely free. Many mentors provide free guidance to help juniors, while some may offer specialized paid sessions."
  },
  {
    question: "How can I become a Mentor?",
    answer: "If you are a student or alumni of a top tier college (IIT, NIT, IIIT, etc.), you can register via the 'Become a Mentor' page. Once verified, you can start guiding students."
  },
  {
    question: "I am unable to Login, what should I do?",
    answer: "If you see 'User not found', please make sure you have registered (Signed Up) first. If you see 'Invalid Password', try creating a new account with a new email if you forgot your credentials."
  },
  {
    question: "How do I contact a Mentor?",
    answer: "You can visit the 'Mentors' page, view their profile, and use the 'Book Session' option. You can also connect with them via the links provided in their bio."
  }
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* HEADING */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
            <HelpCircle size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-500 mt-2">Everything you need to know about the platform.</p>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
              
              {/* Question Button */}
              <button
                onClick={() => toggle(index)}
                className={`w-full flex justify-between items-center p-5 text-left font-medium text-lg transition-colors duration-300 
                  ${activeIndex === index ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              >
                {faq.question}
                {/* 👇 Logic changed: Open hai to 'Up', Closed hai to 'Down' */}
                {activeIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {/* Answer Box */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden 
                  ${activeIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-5 text-gray-600 bg-white border-t border-gray-100 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;