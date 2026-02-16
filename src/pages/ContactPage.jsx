import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { API_BASE_URL } from '../config';
import PageTransition from '../components/PageTransition';
import { FadeIn } from '../components/Animations';
import { motion } from 'framer-motion';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Message Sent Successfully!");
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert("❌ Failed to send.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Server Error: Is your backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "support@navigreat.com",
      link: "mailto:support@navigreat.com",
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      hover: "group-hover:bg-blue-600 group-hover:text-white"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+91 7974714605",
      link: "tel:+917974714605",
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
      hover: "group-hover:bg-green-600 group-hover:text-white"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "MANIT Bhopal, Madhya Pradesh, India",
      link: "https://goo.gl/maps/example",
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      hover: "group-hover:bg-purple-600 group-hover:text-white"
    }
  ];

  return (
    <PageTransition className="pt-20 bg-gray-50 dark:bg-[#0b141a] min-h-screen">

      {/* 1. HERO SECTION */}
      <section className="relative py-20 px-6 bg-white dark:bg-[#111b21] border-b border-gray-200 dark:border-[#2a3942] overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-3xl">
          <FadeIn>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-wider mb-4 uppercase">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              We'd love to hear from you.
            </h1>
            <p className="text-lg text-gray-600 dark:text-[#8696a0]">
              Have a question about our mentorship program? Want to partner with us?
              Fill out the form below or reach out directly.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* 2. CONTACT INFO & MAP (Left Side) */}
          <div className="lg:col-span-1 space-y-8">
            <FadeIn delay={0.2} direction="right">
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#202c33] border border-gray-100 dark:border-[#2a3942] hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className={`p-3 rounded-full ${item.bg} ${item.color} ${item.hover} transition-colors duration-300`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-[#8696a0] mt-1">{item.content}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-[#2a3942]">
                <h3 className="text-sm font-bold text-gray-500 dark:text-[#8696a0] uppercase tracking-wider mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                    <motion.a
                      key={i}
                      whileHover={{ y: -3 }}
                      href="#"
                      className="p-3 bg-white dark:bg-[#202c33] border border-gray-200 dark:border-[#2a3942] rounded-full text-gray-500 dark:text-[#8696a0] hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 transition-colors shadow-sm"
                    >
                      <Icon size={20} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* 3. CONTACT FORM (Right Side - Wider) */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.4}>
              <div className="bg-white dark:bg-[#202c33] rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-gray-100 dark:border-[#2a3942]">
                <div className="p-8 md:p-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#e9edef] mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-[#2a3942] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#e9edef] mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-[#2a3942] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-[#e9edef] mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-[#2a3942] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                        placeholder="What is this about?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-[#e9edef] mb-2">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-[#2a3942] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Tell us how we can help..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-green-500/20 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Sending...' : (
                        <>
                          Send Message <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* 4. MAP SECTION */}
        <FadeIn delay={0.6} className="mt-16">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#2a3942] h-96 relative group">
            <div className="absolute inset-0 bg-gray-200 dark:bg-[#202c33] animate-pulse -z-10"></div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.292276902257!2d77.40280831496734!3d23.21319798485295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c42e43939c5ab%3A0x6901f463327f311!2sMaulana%20Azad%20National%20Institute%20of%20Technology%2C%20Bhopal!5e0!3m2!1sen!2sin!4v1672323456789!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
            ></iframe>
            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold shadow-sm pointer-events-none">
              📍 MANIT Bhopal Campus
            </div>
          </div>
        </FadeIn>

      </div>
    </PageTransition>
  );
}

export default ContactPage;