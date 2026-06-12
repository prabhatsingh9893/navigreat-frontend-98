import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './Animations';

const faqs = [
  {
    question: 'What is NaviGreat?',
    answer: 'NaviGreat is a mentorship platform that connects college students with verified seniors from IITs, NITs, and Top Universities. Get personalized career guidance, placement tips, and goal-specific roadmaps directly from those who\'ve done it.'
  },
  {
    question: 'Is it free to book a session?',
    answer: 'Registration is completely free. Mentors can set their own session fees for premium 1-on-1 guidance. Many basics are accessible for free through our messaging system.'
  },
  {
    question: 'How can I become a Mentor?',
    answer: 'If you\'re a student or alumni of a top-tier college (IIT, NIT, IIIT, etc.), register via the "Become a Mentor" page. Our team will verify your credentials, and you\'ll be live within 48 hours.'
  },
  {
    question: 'How is mentor quality ensured?',
    answer: 'Every mentor is manually verified with valid college ID proof. We also use a transparent ratings & reviews system so that quality is always maintained. Low-rated mentors are reviewed and removed.'
  },
  {
    question: 'I cannot log in, what should I do?',
    answer: 'If you see "User not found", you haven\'t registered yet — click Sign Up first. If you see "Invalid Password", use the Forgot Password option. For Google login issues, make sure popups are enabled for this site.'
  },
  {
    question: 'How do I contact or book a mentor?',
    answer: 'Visit the Mentors page, open any profile, and use the "Book Priority Session" button to pay and confirm a session. You can also send direct messages via our in-app chat.'
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section className="py-24 bg-white dark:bg-slate-900/30">
      <div className="max-w-3xl mx-auto px-6">

        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide mb-4 border border-indigo-200 dark:border-indigo-800">
              Got Questions?
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              Frequently Asked <span className="text-gradient-blue">Questions</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Everything you need to know about NaviGreat.</p>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.06}>
              <div
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  activeIndex === index
                    ? 'border-indigo-200 dark:border-indigo-700 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600'
                } bg-white dark:bg-slate-800`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className={`w-full flex justify-between items-center p-6 text-left font-semibold text-base transition-colors duration-200 ${
                    activeIndex === index
                      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 ml-4 p-1 rounded-lg ${
                      activeIndex === index
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;