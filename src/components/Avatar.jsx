import React, { useState } from 'react';

const Avatar = ({ src, name, size = "w-10 h-10", fontSize = "text-lg", className = "" }) => {
    const [error, setError] = useState(false);

    // If no source or image failed to load (COEP/404), show visuals
    if (!src || error) {
        // Generate consistent color based on name length
        const colors = [
            'bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600',
            'bg-indigo-600', 'bg-pink-600', 'bg-orange-600', 'bg-teal-600'
        ];
        const colorIndex = name ? name.length % colors.length : 0;
        const bgColor = colors[colorIndex];

        return (
            <div
                className={`${size} ${bgColor} text-white flex items-center justify-center font-bold ${fontSize} rounded-full border-2 border-white shadow-sm ${className}`}
                title={name}
            >
                {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            onError={() => setError(true)}
            className={`${size} object-cover rounded-full border-2 border-white shadow-sm ${className}`}
            crossOrigin="anonymous" // Attempt to load with CORS to satisfy COEP if server supports it
        />
    );
};

export default Avatar;
