import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import Loader from '../components/Loader';
import ScreenRecorder from '../components/ScreenRecorder'; // ✅ Import Recorder

const LiveSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const role = location.state?.role || 0;
  const username = location.state?.username || "Student";
  const rawMeetingNumber = location.state?.meetingNumber || "";
  const meetingNumber = rawMeetingNumber.replace(/[^0-9]/g, '');
  const passWord = location.state?.passWord || "";

  // Helper to load script
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true); // Already loaded
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Maintain order
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let mounted = true;

    const initializeZoom = async () => {
      try {
        // Load CSS Dynamically
        if (!document.getElementById("zoom-css-bootstrap")) {
          const link1 = document.createElement("link");
          link1.rel = "stylesheet";
          link1.type = "text/css";
          link1.href = "https://source.zoom.us/2.18.0/css/bootstrap.css";
          link1.id = "zoom-css-bootstrap";
          document.head.appendChild(link1);
        }

        if (!document.getElementById("zoom-css-select")) {
          const link2 = document.createElement("link");
          link2.rel = "stylesheet";
          link2.type = "text/css";
          link2.href = "https://source.zoom.us/2.18.0/css/react-select.css";
          link2.id = "zoom-css-select";
          document.head.appendChild(link2);
        }

        // Load Scripts Sequentially
        if (!window.ZoomMtg) {
          await loadScript("https://source.zoom.us/2.18.0/lib/vendor/react.min.js");
          await loadScript("https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js");
          await loadScript("https://source.zoom.us/2.18.0/lib/vendor/redux.min.js");
          await loadScript("https://source.zoom.us/2.18.0/lib/vendor/redux-thunk.min.js");
          await loadScript("https://source.zoom.us/2.18.0/lib/vendor/lodash.min.js");
          await loadScript("https://source.zoom.us/zoom-meeting-2.18.0.min.js");
        }

        if (mounted) {
          setScriptLoaded(true);

          if (!meetingNumber || !passWord) {
            toast.error("Invalid Meeting Details.");
            navigate('/dashboard');
            return;
          }

          const ZoomMtg = window.ZoomMtg;
          if (ZoomMtg) {
            ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
            ZoomMtg.preLoadWasm();
            ZoomMtg.i18n.load('en-US');
            ZoomMtg.i18n.reload('en-US');

            initiateMeeting(ZoomMtg);
          } else {
            throw new Error("ZoomMtg global not found after script load");
          }
        }
      } catch (error) {
        console.error("Failed to load Zoom scripts", error);
        toast.error("Failed to load Zoom SDK");
        navigate('/dashboard');
      }
    };

    initializeZoom();

    return () => {
      mounted = false;
      const ZoomMtg = window.ZoomMtg;
      if (ZoomMtg) {
        try { ZoomMtg.leaveMeeting({}); } catch (e) { console.warn("Leave meeting error", e); }
      }
      document.body.style.overflow = "auto";

      const zCSS1 = document.getElementById("zoom-css-bootstrap");
      const zCSS2 = document.getElementById("zoom-css-select");
      if (zCSS1) document.head.removeChild(zCSS1);
      if (zCSS2) document.head.removeChild(zCSS2);

      const zoomRoot = document.getElementById('zmmtg-root');
      if (zoomRoot) zoomRoot.style.display = 'none';

      // Reload on cleanup is removed to prevent errors
    };
  }, []);

  const initiateMeeting = async (ZoomMtg) => {
    try {
      console.log("🚀 Fetching Signature...");
      const response = await fetch(`${API_BASE_URL}/generate-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ meetingNumber, role })
      });

      const data = await response.json();
      if (data.signature) {
        startMeeting(ZoomMtg, data.signature);
      } else {
        toast.error("Signature Error");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      setLoading(false); // Stop loading
      setScriptLoaded(false); // Show error state
      toast.error("Connection Error: " + error.message);
      // Removed auto-navigate to allow reading error
    }
  };

  const startMeeting = (ZoomMtg, signature) => {
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) zoomRoot.style.display = 'block';

    const initTimeout = setTimeout(() => {
      if (loading) {
        toast('Preparing high-quality video engine...', { icon: '🎥' });
      }
    }, 15000); // Notify only if it takes > 15 seconds

    setTimeout(() => {
      ZoomMtg.init({
        leaveUrl: window.location.origin + '/dashboard?meeting_ended=true' + (location.state?.mentorId ? `&mentorId=${location.state.mentorId}` : ''),
        isSupportAV: true,
        disableRecord: false,
        sharingMode: 'both',
        debug: true, // ✅ Enable Debug Logs
        success: (success) => {
          clearTimeout(initTimeout);
          setLoading(false); // Init done, now joining
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
          clearTimeout(initTimeout);
          console.error(err);
          setLoading(false);
          toast.error("Init Failed: " + (err.message || JSON.stringify(err)));
        },
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[50] bg-black h-screen w-screen">
      {/* Container must be fixed to break out of any parent layout constraints */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white space-y-4">
          <Loader text={scriptLoaded ? "Initializing Meeting..." : "Loading Zoom Resources..."} />
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm">
            Reload Page
          </button>
        </div>
      )}
      {!loading && !scriptLoaded && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-red-500">
          <h3 className="text-xl font-bold mb-2">Connection Failed</h3>
          <p className="mb-4 text-gray-300">Could not connect to Zoom services.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">
            Return to Dashboard
          </button>
        </div>
      )}
      <div id="zmmtg-root"></div>

      {/* 📹 Local Screen Recorder (Mentors Only) */}
      {!loading && scriptLoaded && role === 1 && <ScreenRecorder />}
    </div>
  );
};

export default LiveSession;