import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import Loader from '../components/Loader';

// ⚠️ DO NOT IMPORT from '@zoom/meetingsdk'
// Humne index.html me CDN lagaya hai, wahi se uthayenge.
const ZoomMtg = window.ZoomMtg;

const LiveSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const role = location.state?.role || 0;
  const username = location.state?.username || "Student";
  const rawMeetingNumber = location.state?.meetingNumber || "";
  const meetingNumber = rawMeetingNumber.replace(/[^0-9]/g, '');
  const passWord = location.state?.passWord || "";

  useEffect(() => {
    // Dynamically inject Zoom CSS
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.type = "text/css";
    link1.href = "https://source.zoom.us/3.8.0/css/bootstrap.css";
    link1.id = "zoom-css-bootstrap";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.type = "text/css";
    link2.href = "https://source.zoom.us/3.8.0/css/react-select.css";
    link2.id = "zoom-css-select";
    document.head.appendChild(link2);

    // 1. Check if Zoom loaded from CDN
    if (!ZoomMtg) {
      toast.error("Zoom Script not loaded. Refresh page.");
      return;
    }

    if (!meetingNumber || !passWord) {
      toast.error("Invalid Meeting Details.");
      navigate('/dashboard');
      return;
    }

    // 2. Set CDN Library Path (Zaruri Hai)
    ZoomMtg.setZoomJSLib('https://source.zoom.us/3.8.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.i18n.load('en-US');
    ZoomMtg.i18n.reload('en-US');

    initiateMeeting();

    return () => {
      ZoomMtg.leaveMeeting({});
      document.body.style.overflow = "auto";

      // Cleanup Zoom CSS
      const zCSS1 = document.getElementById("zoom-css-bootstrap");
      const zCSS2 = document.getElementById("zoom-css-select");
      if (zCSS1) document.head.removeChild(zCSS1);
      if (zCSS2) document.head.removeChild(zCSS2);

      // Force reload to clear memory leaks from Zoom
      window.location.reload();
    };
  }, []);

  const initiateMeeting = async () => {
    try {
      console.log("🚀 Fetching Signature...");
      const response = await fetch(`${API_BASE_URL}/generate-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNumber, role })
      });

      const data = await response.json();
      if (data.signature) {
        startMeeting(data.signature);
      } else {
        toast.error("Signature Error");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error("Network Error");
      navigate('/dashboard');
    }
  };

  const startMeeting = (signature) => {
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
      zoomRoot.style.display = 'block';
    }

    ZoomMtg.init({
      leaveUrl: window.location.origin + '/dashboard',
      isSupportAV: true,
      success: (success) => {
        setLoading(false);
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: username,
          sdkKey: import.meta.env.VITE_ZOOM_CLIENT_ID,
          userEmail: "",
          tk: "",
          success: (res) => {
            console.log("Joined Meeting Successfully");
          },
          error: (err) => {
            console.error(err);
            toast.error(err.message || "Join Failed");
          },
        });
      },
      error: (err) => {
        console.error(err);
        toast.error("Init Failed");
      },
    });
  };

  return (
    <div className="bg-black h-screen w-screen relative">
      {loading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center text-white">
          <Loader text="Starting Zoom via CDN..." />
        </div>
      )}
      <div id="zmmtg-root"></div>
    </div>
  );
};

export default LiveSession;