import React, { useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Square, Download, Trash2, MonitorPlay } from 'lucide-react';
import toast from 'react-hot-toast';

const ScreenRecorder = () => {
    const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, error } =
        useReactMediaRecorder({ screen: true, audio: true });

    useEffect(() => {
        if (error) toast.error("Recording Error: " + error);
    }, [error]);

    const handleStart = () => {
        startRecording();
        toast.success("Recording Started! don't forget to share system audio when prompted.");
    };

    const handleStop = () => {
        stopRecording();
        toast.success("Recording Stopped!");
    };

    if (status === 'idle') {
        return (
            <div className="fixed bottom-24 right-4 z-[9999]">
                <button
                    onClick={handleStart}
                    className="bg-gray-900/90 backdrop-blur text-white p-3 rounded-full shadow-lg border border-gray-700 hover:bg-red-600 transition-all flex items-center gap-2 group"
                    title="Record this session"
                >
                    <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">Record Screen</span>
                </button>
            </div>
        );
    }

    if (status === 'recording') {
        return (
            <div className="fixed bottom-24 right-4 z-[9999] bg-gray-900/90 backdrop-blur rounded-2xl p-4 border border-red-500/50 shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                        <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
                    </div>
                    <div className="text-white text-sm font-mono font-bold">REC</div>
                    <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
                    <button
                        onClick={handleStop}
                        className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 font-bold text-xs"
                    >
                        <Square size={14} fill="currentColor" /> STOP
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'stopped' && mediaBlobUrl) {
        return (
            <div className="fixed bottom-24 right-4 z-[9999] bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 animate-in slide-in-from-right duration-300 w-64">
                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <MonitorPlay size={16} className="text-blue-600" /> Recording Ready
                </h4>
                {/* Preview Video */}
                <video src={mediaBlobUrl} className="w-full rounded-lg bg-black mb-3 border" controls />

                <div className="flex gap-2">
                    <a
                        href={mediaBlobUrl}
                        download={`Navigreat_Session_${new Date().getTime()}.mp4`}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-700 transition"
                    >
                        <Download size={14} /> Save
                    </a>
                    <button
                        onClick={clearBlobUrl}
                        className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-red-500 transition"
                        title="Discard"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default ScreenRecorder;
