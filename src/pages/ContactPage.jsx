import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../config';
import PageTransition from '../components/PageTransition';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Button Clicked! Sending data...");

    try {
      // Connect to your Backend
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
      alert("❌ Server Error: Is your backend running on port 5000?");
    }
  };

  return (
    <PageTransition className="pt-28 pb-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Contact</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition outline-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold w-full hover:bg-blue-700 shadow-lg transition-transform transform hover:-translate-y-1">
                Send Message
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 group p-4 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><Mail /></div>
              <span className="text-lg font-medium text-gray-700">support@navigreat.com</span>
            </div>
            <div className="flex items-center gap-4 group p-4 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><Phone /></div>
              <span className="text-lg font-medium text-gray-700">+91 7974714605</span>
            </div>
            <div className="flex items-center gap-4 group p-4 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><MapPin /></div>
              <span className="text-lg font-medium text-gray-700">Maulana Azad National Institute of Technology, Bhopal</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default ContactPage;