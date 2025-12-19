import React from 'react';
import { Award, Users, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="pt-20 font-sans bg-white text-gray-800">

            {/* 1. HERO SECTION */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 text-center text-white overflow-hidden">
                {/* Abstract Shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <span className="uppercase tracking-widest text-xs font-bold text-blue-300 mb-4 block">Our Mission</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Empowering the Next Generation <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">of Engineers</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-blue-100 mb-10 leading-relaxed">
                        NaviGreat is bridging the gap between ambition and achievement. We connect aspiring students
                        with verified mentors from top IITs and NITs to democratize career guidance.
                    </p>
                </div>
            </section>

            {/* 2. STATS / IMPACT */}
            <section className="py-16 bg-blue-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Users size={32} />, val: "500+", label: "Students Guided" },
                            { icon: <Award size={32} />, val: "50+", label: "Top Mentors" },
                            { icon: <Target size={32} />, val: "100%", label: "Verified Expertise" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm text-center transform transition hover:-translate-y-1 hover:shadow-md">
                                <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
                                    {stat.icon}
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.val}</h3>
                                <p className="text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. STORY SECTION */}
            <section className="py-24">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Team collaboration"
                            className="rounded-3xl shadow-2xl"
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">Why We Started</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            It started with a simple observation: Talent is everywhere, but opportunity is not.
                            Many brilliant students fail to crack top exams or land dream jobs simply due to a lack of
                            guidance, not ability.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            We decided to build a platform that removes the barriers. No more cold-emailing seniors
                            or guessing your path. Get 1:1 mentorship from those who have already done it.
                        </p>
                        <Link to="/mentors" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                            Meet Our Mentors <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. CTA */}
            <section className="bg-slate-900 py-20 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to find your path?</h2>
                    <div className="flex justify-center gap-4">
                        <Link to="/mentors" className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                            Find a Mentor
                        </Link>
                        <Link to="/contact" className="bg-transparent border border-slate-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;
