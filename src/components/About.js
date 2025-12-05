import React from 'react';

const About = () => {
  return (
    <div className="font-sans text-gray-800">
      
      {/* 1. Hero Section (About Us Heading) */}
      <div className="bg-blue-600 text-white py-20 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">About EduMentorConnect</h1>
        <p className="text-xl max-w-2xl mx-auto">
          We are bridging the gap between ambition and achievement through expert mentorship from IITians and NITians.
        </p>
      </div>

      {/* 2. Mission Section (Optional text) */}
      <div className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
        <p className="text-lg text-gray-600 mb-6">
          Every student deserves guidance. Our platform connects aspiring students with mentors who have walked the same path and succeeded.
        </p>
      </div>

      {/* 3. The "Last Portion" (FAQ Section form your image) */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="group bg-white p-5 rounded-lg shadow-sm cursor-pointer border border-gray-200">
              <summary className="flex justify-between items-center font-semibold text-lg list-none">
                <span>How do I find the right mentor?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                You can browse our list of mentors filtered by their college (IIT/NIT), branch, and expertise to find the perfect match for your goals.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-white p-5 rounded-lg shadow-sm cursor-pointer border border-gray-200">
              <summary className="flex justify-between items-center font-semibold text-lg list-none">
                <span>What is the cost?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                Mentorship sessions are affordable and pricing varies by mentor. We believe in quality guidance accessible to everyone.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-white p-5 rounded-lg shadow-sm cursor-pointer border border-gray-200">
              <summary className="flex justify-between items-center font-semibold text-lg list-none">
                <span>Are mentors verified?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                Yes! Every mentor on our platform is verified to be a current student or alumni of a top-tier institution like IITs or NITs.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-white p-5 rounded-lg shadow-sm cursor-pointer border border-gray-200">
              <summary className="flex justify-between items-center font-semibold text-lg list-none">
                <span>Can I become a mentor?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                Absolutely. If you are a student at a top college and want to guide juniors, click on the 'Become a Mentor' button to apply.
              </p>
            </details>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;