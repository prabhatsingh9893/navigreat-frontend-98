import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-white">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <h3 className="text-xl font-bold animate-pulse">{text}</h3>
            <p className="text-gray-400 text-sm mt-2">Please wait while we set things up.</p>
        </div>
    );
};

export default Loader;
