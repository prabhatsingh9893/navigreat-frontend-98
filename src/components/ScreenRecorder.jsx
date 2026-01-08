import React, { useState, useRef } from 'react';
import { Square, Download, Trash2, MonitorPlay, Mic, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

const ScreenRecorder = () => {
    const [status, setStatus] = useState('idle'); // idle, recording, stopped
    const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            // 1. Get Screen Stream (Video + System Audio)
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: true // Request System Audio
            });

            // Check if user shared audio
            const screenAudioTrack = screenStream.getAudioTracks()[0];
            if (!screenAudioTrack) {
                toast("⚠️ System audio not shared. Student voice won't be recorded.", { icon: "🔊" });
            }

            // 2. Get Microphone Stream (Mentor Voice)
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // 3. Mix Audio Streams if both exist
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();

            // Add Mic to Mix
            if (micStream.getAudioTracks().length > 0) {
                const micSource = audioContext.createMediaStreamSource(micStream);
                micSource.connect(destination);
            }

            // Add System Audio to Mix
            if (screenAudioTrack) {
                const sysSource = audioContext.createMediaStreamSource(screenStream);
                sysSource.connect(destination);
            }

            // 4. Combine Video + Mixed Audio
            const mixedStream = new MediaStream([
                ...screenStream.getVideoTracks(),
                ...destination.stream.getAudioTracks()
            ]);

            // 5. Setup Recorder
            const mediaRecorder = new MediaRecorder(mixedStream, { mimeType: 'video/webm; codecs=vp9' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setMediaBlobUrl(url);
                setStatus('stopped');

                // Stop all tracks to clear "Recording" indicator in browser
                screenStream.getTracks().forEach(track => track.stop());
                micStream.getTracks().forEach(track => track.stop());
            };

            // Handle user clicking "Stop Sharing" on browser UI
            screenStream.getVideoTracks()[0].onended = () => {
                stopRecording();
            };

            mediaRecorder.start();
            setStatus('recording');
            toast.success("Recording Started! (Mic + System Audio)");

        } catch (err) {
            console.error("Error starting recording:", err);
            toast.error("Could not start recording: " + err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const clearBlobUrl = () => {
        setMediaBlobUrl(null);
        setStatus('idle');
    };

    if (status === 'idle') {
        return (
            <div className="fixed bottom-24 right-4 z-[99999]">
                <button
                    onClick={startRecording}
                    className="bg-gray-900/90 backdrop-blur text-white p-4 rounded-full shadow-2xl border-2 border-white/20 hover:bg-red-600 hover:scale-105 transition-all flex items-center gap-3 group"
                    title="Record this session"
                >
                    <div className="relative">
                        <div className="bg-red-500 w-4 h-4 rounded-full"></div>
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">Start Recording</span>
                </button>
            </div>
        );
    }

    if (status === 'recording') {
        return (
            <div className="fixed bottom-24 right-4 z-[99999] bg-gray-900/90 backdrop-blur rounded-2xl p-4 border border-red-500/50 shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <Mic size={10} className="text-green-400" /> ON
                            <span className="text-gray-600">|</span>
                            <Monitor size={10} className="text-blue-400" /> SHARED
                        </div>
                    </div>

                    <div className="h-6 w-[1px] bg-gray-600"></div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-bold font-mono text-sm tracking-wider">REC</span>
                    </div>

                    <button
                        onClick={stopRecording}
                        className="ml-2 bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 font-bold text-xs shadow-sm"
                    >
                        <Square size={12} fill="currentColor" /> STOP
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'stopped' && mediaBlobUrl) {
        return (
            <div className="fixed bottom-24 right-4 z-[99999] bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 animate-in slide-in-from-right duration-300 w-72">
                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <MonitorPlay size={16} className="text-blue-600" /> Recording Ready
                </h4>
                {/* Preview Video */}
                <video src={mediaBlobUrl} className="w-full rounded-lg bg-black mb-3 border aspect-video" controls />

                <div className="flex gap-2">
                    <a
                        href={mediaBlobUrl}
                        download={`Navigreat_Session_${new Date().toISOString().slice(0, 10)}.webm`}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200"
                    >
                        <Download size={16} /> Save Video
                    </a>
                    <button
                        onClick={clearBlobUrl}
                        className="px-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition border border-red-100"
                        title="Discard"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default ScreenRecorder;
