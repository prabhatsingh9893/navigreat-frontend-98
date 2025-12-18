import React, { useEffect } from 'react';
import { ZoomMtg } from '@zoomus/websdk';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ✅ Zoom CSS (Zaruri hai)
import '@zoomus/websdk/dist/css/bootstrap.css';
import '@zoomus/websdk/dist/css/react-select.css';

// --- CONFIGURATION ---
// ⚠️ Yahan apni Asli Zoom Keys daalein (Marketplace > Build App > Meeting SDK)
const SDK_KEY = "YOUR_CLIENT_ID_HERE"; 
const SDK_SECRET = "YOUR_CLIENT_SECRET_HERE";

const SessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Data Receive kar rahe hain (Profile Page se)
  const meetingNumber = location.state?.meetingNumber;
  const passWord = location.state?.passWord;

  useEffect(() => {
    // Agar Meeting ID nahi mili (Direct link open kiya), to wapas bhej do
    if (!meetingNumber) {
        toast.error("No meeting details found. Join via Mentor Profile.");
        navigate('/dashboard');
        return;
    }

    // Zoom Setup
    ZoomMtg.setZoomJLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    initiateMeeting();
  }, [meetingNumber, navigate]);

  const initiateMeeting = () => {
    // Generate Signature (Testing ke liye client-side)
    ZoomMtg.generateSDKSignature({
      meetingNumber: meetingNumber,
      sdkKey: SDK_KEY,
      sdkSecret: SDK_SECRET,
      role: 0, // 0 = Student (Participant), 1 = Host
      success: function (res) {
        startMeeting(res.result);
      },
      error: function (err) {
        console.log(err);
        toast.error("Signature Error");
      }
    });
  };

  const startMeeting = (signature) => {
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) zoomRoot.style.display = 'block';

    ZoomMtg.init({
      leaveUrl: window.location.origin + '/dashboard',
      success: (success) => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber, // ✅ Ab ye Dynamic ID lega
          passWord: passWord,           // ✅ Ab ye Dynamic Password lega
          userName: "Student",          // Future me: user.username
          sdkKey: SDK_KEY,
          userEmail: "",                // Optional
          success: (res) => {
            console.log("Joined Successfully");
          },
          error: (err) => {
            console.log(err);
            toast.error(err.method || "Join Failed");
          },
        });
      },
      error: (err) => {
        console.log(err);
        toast.error("Zoom Init Failed");
      },
    });
  };

  return (
    <div className="bg-black h-screen w-screen flex items-center justify-center text-white">
        {/* Jab tak Zoom load nahi hota, ye dikhega */}
        <div className="text-center">
            <h2 className="text-2xl font-bold animate-pulse mb-2">Connecting to Class...</h2>
            <p className="text-gray-400">Please wait while we set up the secure room.</p>
            <p className="text-xs text-gray-600 mt-4">Meeting ID: {meetingNumber}</p>
        </div>

        {/* Zoom SDK Container (Iska ID mat badalna) */}
        <div id="zmmtg-root" className="hidden"></div> 
    </div>
  );
};

export default SessionPage;