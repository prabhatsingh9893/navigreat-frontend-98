import React, { useEffect, useState } from 'react';
import * as ZoomSDK from '@zoom/meetingsdk';
const ZoomMtg = ZoomSDK.ZoomMtg || ZoomSDK.default || window.ZoomMtg;

import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import Loader from '../components/Loader';

// ✅ Zoom CSS
import '@zoom/meetingsdk/dist/ui/zoom-meetingsdk.css';

const SessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // 1. Data Receive kar rahe hain (Profile/Dashboard se)
  const role = location.state?.role || 0; // 0 = Student (Default), 1 = Host (Mentor)
  const username = location.state?.username || "Student";

  // ✅ Sanitization: Remove spaces/dashes from ID
  const rawMeetingNumber = location.state?.meetingNumber || "";
  const meetingNumber = rawMeetingNumber.replace(/[^0-9]/g, '');
  const passWord = location.state?.passWord || "";

  useEffect(() => {
    // Agar Meeting ID nahi mili (Direct link open kiya), to wapas bhej do
    if (!meetingNumber) {
      toast.error("No meeting details found. Join via Dashboard or Profile.");
      navigate('/dashboard');
      return;
    }

    // Zoom Setup
    ZoomMtg.setZoomJSLib('https://source.zoom.us/5.0.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    initiateMeeting();
  }, [meetingNumber, navigate]);

  const initiateMeeting = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role
        })
      });

      const data = await response.json();

      if (data.signature) {
        startMeeting(data.signature, data.sdkKey);
      } else {
        toast.error("Signature generation failed");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error: Could not connect to Zoom Server");
      navigate('/dashboard');
    }
  };

  const startMeeting = (signature, sdkKey) => {
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) zoomRoot.style.display = 'block';
    setLoading(false);

    ZoomMtg.init({
      leaveUrl: window.location.origin + '/dashboard',
      isSupportAV: true,
      success: (success) => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: username,
          sdkKey: sdkKey,
          userEmail: "",
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
    <div className="bg-black h-screen w-screen relative overflow-hidden">
      {/* Custom Loader */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <Loader text="Securing Classroom..." />
        </div>
      )}

      {/* Zoom SDK Container */}
      <div id="zmmtg-root" className="w-full h-full"></div>
    </div>
  );
};

export default SessionPage;