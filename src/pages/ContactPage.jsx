import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

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
    e.preventDefault(); // <--- THIS IS KEY: It stops the page from reloading!
    console.log("Button Clicked! Sending data..."); 

    try {
      // Connect to your Backend
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert("✅ Message Sent Successfully!");
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear the form
      } else {
        alert("❌ Failed to send.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Server Error: Is your backend running on port 5000?");
    }
  };

  return (
    <div className="pt-28 pb-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Contact</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a message</h2>
            
            {/* The onSubmit here triggers the handleSubmit function */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Name</label>
                <input 
                  type="text" 
                  name="name"  // <--- This was missing in your screenshot!
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                <input 
                  type="email" 
                  name="email" // <--- This was missing!
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Message</label>
                <textarea 
                  name="message" // <--- This was missing!
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold w-full hover:bg-blue-700 shadow-lg">
                Send Message
              </button>
            </form>
          </div>

          {/* Right Side Info */}
          <div className="flex flex-col gap-8">
             <div className="flex items-center gap-4"><Mail className="text-blue-600"/> support@edumentor.com</div>
             <div className="flex items-center gap-4"><Phone className="text-blue-600"/> +91 98765 43210</div>
             <div className="flex items-center gap-4"><MapPin className="text-blue-600"/> Bhopal, India</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;