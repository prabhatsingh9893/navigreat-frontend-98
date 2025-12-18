import React, { useEffect } from 'react';
import { ZoomMtg } from "@zoom/meetingsdk";
import { Video, Mic, MonitorUp, Users, AlertCircle } from "lucide-react";

// ✅ NOTE: Humne CSS import hata diya hai kyunki index.html me CDN laga diya hai.
// Ab woh "Red Error" nahi aayega.

const LiveSession = () => {

  useEffect(() => {
    // 1. Zoom SDK Basic Setup
    ZoomMtg.setZoomJLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();
  }, []);

  const startMeeting = () => {
    // Yahan hum baad mein backend se signature layenge
    console.log("Meeting Start Button Clicked!");
    alert("Backend connect hone ke baad meeting start hogi!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mentorship Live Session</h1>
          <p className="text-gray-400 text-sm">Session ID: 882-123-456</p>
        </div>
        <div className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          LIVE
        </div>
      </div>

      {/* Video Placeholder Area */}
      <div className="w-full max-w-6xl h-[500px] bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300">Ready to Connect?</h2>
          <p className="text-gray-500 mt-2">Click the button below to join the class.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-6 bg-gray-800 px-8 py-4 rounded-full border border-gray-700 shadow-lg">
        <button onClick={startMeeting} className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white font-bold flex items-center gap-2">
          <Video className="w-6 h-6" />
          Join Meeting
        </button>
        
        <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition text-white">
          <Mic className="w-6 h-6" />
        </button>

        <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition text-white">
          <MonitorUp className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
};

export default LiveSession;