import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import Loader from '../components/Loader';
import ScreenRecorder from '../components/ScreenRecorder';

const LiveSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = location.state?.role || 0;
  const username = location.state?.username || "Student";
  const rawMeetingNumber = location.state?.meetingNumber || "";
  // यह String है (जैसे "123456")
  const meetingNumber = rawMeetingNumber.replace(/[^0-9]/g, '');
  const passWord = location.state?.passWord || "";

  useEffect(() => {
    if (!meetingNumber || !passWord) {
      toast.error("Invalid Meeting Details");
      navigate('/dashboard');
      return;
    }

    const generateSignature = async () => {
      try {
        console.log("Generating signature for:", meetingNumber);

        const response = await fetch(`${API_BASE_URL}/generate-signature`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          // 👇 CHANGE HERE: meetingNumber को parseInt करके भेजें (String -> Number)
          body: JSON.stringify({
            meetingNumber: parseInt(meetingNumber, 10),
            role
          })
        });

        const data = await response.json();

        if (data.signature) {
          const leaveUrl = window.location.origin + '/dashboard?meeting_ended=true';
          const sdkKey = import.meta.env.VITE_ZOOM_CLIENT_ID;

          // Construct the isolated meeting URL
          // URL में String ही रहने दें, वहां कोई दिक्कत नहीं है
          const url = `/meeting.html?mn=${meetingNumber}&pwd=${passWord}&sig=${encodeURIComponent(data.signature)}&sdkKey=${sdkKey}&name=${encodeURIComponent(username)}&leaveUrl=${encodeURIComponent(leaveUrl)}`;
          setMeetingUrl(url);
          setLoading(false);
        } else {
          toast.error("Signature Missing");
          console.error("Backend Response:", data);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
        toast.error("Network Error: " + error.message);
        navigate('/dashboard');
      }
    };

    generateSignature();
  }, [meetingNumber, passWord, role, username, navigate]);

  return (
    <div className="fixed inset-0 z-[50] bg-black h-screen w-screen flex flex-col">
      {/* Screen Recorder for Mentor */}
      {role === 1 && <ScreenRecorder />}

      {/* Debug/Fallback: Open in New Tab */}
      <div className="absolute top-4 right-4 z-[60]">
        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Trouble connecting? Open in new tab
          </a>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
          <Loader text="Preparing Secure Session..." />
        </div>
      )}

      {/* Isolated Zoom Iframe */}
      {meetingUrl && (
        <iframe
          src={meetingUrl}
          allow="microphone; camera; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Zoom Meeting"
        />
      )}
    </div>
  );
};

export default LiveSession;