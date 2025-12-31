import React from 'react';

const TermsOfUse = () => {
    return (
        <div className="container mx-auto px-4 py-16 text-gray-800">
            <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
            <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="mb-4">
                By accessing or using Navigreat, you agree to be bound by these Terms of Use.
            </p>

            <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
            <p className="mb-4">
                You agree to use our platform only for lawful purposes. Harassment, abuse, or misuse of the mentorship features
                will result in account termination.
            </p>

            <h2 className="text-xl font-semibold mb-2">3. Zoom Sessions</h2>
            <p className="mb-4">
                Video sessions are conducted via Zoom. You must adhere to Zoom's acceptable use policy during all sessions.
                Recording of sessions without consent is strictly prohibited unless enabled by the platform features.
            </p>

            <h2 className="text-xl font-semibold mb-2">4. Disclaimers</h2>
            <p className="mb-4">
                Navigreat is provided "as is" without warranties of any kind. We are not responsible for the advice given by mentors.
            </p>

            <h2 className="text-xl font-semibold mb-2">5. Contact</h2>
            <p className="mb-4">
                For any inquiries regarding these terms, contact legal@navigreat.com.
            </p>
        </div>
    );
};

export default TermsOfUse;
