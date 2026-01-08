import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import Loader from '../components/Loader';
import ScreenRecorder from '../components/ScreenRecorder';

const LiveSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Capture state ONCE on mount to ensure stability even if history is cleared
  const [sessionState] = useState(location.state || {});
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = sessionState.role || 0;
  // Attempt to get name from state, then localStorage, then default
  const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
  const username = sessionState.username || storedUser.username || "Student";
  const rawMeetingNumber = sessionState.meetingNumber || "";
  const meetingNumber = rawMeetingNumber.replace(/[^0-9]/g, '');
  const passWord = sessionState.passWord || "";

  useEffect(() => {
    // If details are missing from the captured state, redirect immediately
    if (!meetingNumber || !passWord) {
      console.warn("Missing meeting details in session state.");
      // Small delay to allow toast to render if needed, or just redirect
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
          body: JSON.stringify({
            meetingNumber: parseInt(meetingNumber, 10),
            role
          })
        });

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.signature) {
          // SAVE SESSION FOR AUTO-REJOIN
          sessionStorage.setItem('currentSession', JSON.stringify({ meetingNumber, passWord, role, username }));

          const leaveUrl = window.location.origin + '/session-ended';
          const sdkKey = import.meta.env.VITE_ZOOM_CLIENT_ID;

          const url = `/meeting.html?mn=${meetingNumber}&pwd=${passWord}&sig=${encodeURIComponent(data.signature)}&sdkKey=${sdkKey}&name=${encodeURIComponent(username)}&leaveUrl=${encodeURIComponent(leaveUrl)}`;
          setMeetingUrl(url);
          setLoading(false);

          // History clearing removed to allow user to refresh page if connection fails
        } else {
          toast.error("Invalid Signature Received");
          console.error("Backend Response:", data);
          // Don't auto-navigate away immediately, let user see error
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("Network Error: " + error.message);
        navigate('/dashboard');
      }
    };

    generateSignature();
    // Depend ONLY on the captured sessionState values, not location.state
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