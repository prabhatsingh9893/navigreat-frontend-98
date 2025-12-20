import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config'; // Ensure this points to your backend
import Loader from '../components/Loader';

// ✅ Zoom SDK Imports
import { ZoomMtg } from '@zoom/meetingsdk';
// Version 3.1.6 uses these CSS files instead of the unified zoom-meetingsdk.css
import '@zoom/meetingsdk/dist/css/bootstrap.css';
import '@zoom/meetingsdk/dist/css/react-select.css';

const SessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // --- 1. RECEIVE DATA ---
  // Default values if data is missing
  const role = location.state?.role || 0; // 0 = Student, 1 = Host
  const username = location.state?.username || "Student";
  const rawMeetingNumber = location.state?.meetingNumber || "";
  const meetingNumber = rawMeetingNumber.replace(/[^0-9]/g, ''); // Sanitization
  const passWord = location.state?.passWord || "";

  // --- 2. ZOOM SETUP & CLEANUP ---
  useEffect(() => {
    // A. Validation
    if (!meetingNumber || !passWord) {
      toast.error("Invalid Meeting Details. Please join via Dashboard.");
      navigate('/dashboard');
      return;
    }

    // B. Zoom Library Settings (Updated Version 3.1.6)
    // Use local assets from public/lib to match installed version 3.1.6
    // This avoids ChunkLoadError and tp.min.js issues from CDN mismatches.
    ZoomMtg.setZoomJSLib(window.location.origin + '/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    // C. Start Process
    initiateMeeting();

    // D. Cleanup (Restore Page State)
    return () => {
      // 1. Leave Meeting
      ZoomMtg.leaveMeeting({});

      // 2. Refresh Page to clear Zoom's Global CSS (Bootstrap) pollution
      // This is necessary because Zoom injects styles that shrink the website.
      if (window.location.pathname === '/session') {
        window.location.href = '/dashboard';
      }

      // 3. Force Cleanup if SPA navigation happens
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
      document.documentElement.style.overflow = "auto";

      const zoomRoot = document.getElementById('zmmtg-root');
      if (zoomRoot) zoomRoot.style.display = 'none';

      // 4. Reset Viewport (Zoom changes this to disable scaling)
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) viewport.content = "width=device-width, initial-scale=1.0";
    };
  }, [meetingNumber, passWord, navigate]);

  // --- 3. GENERATE SIGNATURE (Backend Call) ---
  const initiateMeeting = async () => {
    try {
      // Backend request to get signature
      const signatureUrl = `${API_BASE_URL}/generate-signature`;
      console.log("🚀 Fetching Signature from:", signatureUrl); // DEBUG LOG
      const response = await fetch(signatureUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role
        })
      });

      const data = await response.json();

      if (data.signature) {
        startMeeting(data.signature);
      } else {
        console.error("Signature Error:", data);
        toast.error("Failed to generate secure signature.");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Could not connect to server.");
      navigate('/dashboard');
    }
  };

  // --- 4. JOIN MEETING ---
  const startMeeting = (signature) => {
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) zoomRoot.style.display = 'block';

    // Zoom SDK Initialization
    ZoomMtg.init({
      leaveUrl: window.location.origin + '/dashboard', // Meeting end hone par yaha jayega
      isSupportAV: true,
      success: (success) => {
        setLoading(false); // Hide Loader

        // Join the actual meeting
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: username,
          sdkKey: import.meta.env.VITE_ZOOM_CLIENT_ID, // ✅ Client ID from .env
          userEmail: "",
          success: (res) => {
            console.log("✅ Joined Meeting Successfully", res);
          },
          error: (err) => {
            console.error("❌ JOIN ERROR:", err);
            const key = import.meta.env.VITE_ZOOM_CLIENT_ID;
            console.log("Debug Params:", { meetingNumber, role });
            console.log("Key Details:", {
              val: key,
              len: key?.length,
              type: typeof key
            });
            toast.error(err.result || "Could not join meeting");
            setLoading(false);
          },
        });
      },
      error: (err) => {
        console.error(err);
        toast.error("Zoom Initialization Failed");
        setLoading(false);
      },
    });
  };

  return (
    <div className="bg-black h-screen w-screen relative overflow-hidden">

      {/* Custom Loader */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
          <Loader text="Connecting to Class..." />
          <p className="mt-4 text-gray-400 text-sm animate-pulse">Establishing Secure Connection...</p>
        </div>
      )}

      {/* Zoom SDK Container - Must allow Zoom to take over */}
      <div id="zmmtg-root" className="w-full h-full absolute inset-0 z-0"></div>
    </div>
  );
};

export default SessionPage;