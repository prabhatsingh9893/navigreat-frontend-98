import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-16 text-gray-800">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4">Effective Date: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="mb-4">
                Welcome to Navigreat. We value your privacy and are committed to protecting your personal data.
                This privacy policy explains how we collect, use, and share your information when you use our platform.
            </p>

            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-4">
                We may collect personal information such as your name, email address, and role (student or mentor)
                to facilitate video sessions and mentorship connections.
            </p>

            <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4">
                <li>To provide and manage video conferencing services via Zoom.</li>
                <li>To connect students with mentors.</li>
                <li>To improve our platform's performance and user experience.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-2">4. Third-Party Services</h2>
            <p className="mb-4">
                We use third-party services like Zoom for video calls. By using these features, you agree to Zoom's privacy policy as well.
            </p>

            <h2 className="text-xl font-semibold mb-2">5. Contact Us</h2>
            <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at support@navigreat.com.
            </p>
        </div>
    );
};

export default PrivacyPolicy;
