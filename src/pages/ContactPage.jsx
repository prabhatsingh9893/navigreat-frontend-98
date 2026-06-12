import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { API_BASE_URL } from '../config';
import PageTransition from '../components/PageTransition';
import { FadeIn } from '../components/Animations';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Server error. Please check your connection.');
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
    <PageTransition className="pt-20 bg-slate-50 dark:bg-[#080d14] min-h-screen">

      {/* 1. HERO SECTION */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        <div className="container mx-auto text-center relative z-10 max-w-3xl px-6">
          <FadeIn>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-bold tracking-wider mb-6">
              Get in Touch
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              We&apos;d love to hear from you.
            </h1>
            <p className="text-xl text-indigo-200/90 leading-relaxed">
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
                      className="btn-primary px-8 py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>Send Message <Send size={18} /></>
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