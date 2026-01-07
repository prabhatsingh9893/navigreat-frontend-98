import React from 'react';
import PageTransition from '../components/PageTransition';

const AppPrivacy = () => {
    return (
        <PageTransition>
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
                        <p className="text-slate-500 mb-8">Last Updated: January 07, 2026</p>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">1. Introduction</h3>
                            <p className="mb-4 text-slate-600">
                                Welcome to <strong>NaviGreat</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                                If you have any questions or concerns about this policy, or our practices with regards to your personal information, please contact us at support@navigreat.com.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">2. Information We Collect</h3>
                            <p className="mb-4 text-slate-600">
                                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-slate-600">
                                <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; passwords; contact preferences; and other similar information.</li>
                                <li><strong>Social Media Login Data:</strong> We may provide you with the option to register with us using your existing social media account details, like your Facebook, Twitter or other social media account.</li>
                            </ul>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">3. How We Use Your Information</h3>
                            <p className="mb-4 text-slate-600">
                                We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-slate-600">
                                <li>To facilitate account creation and logon process.</li>
                                <li>To send you marketing and promotional communications.</li>
                                <li>To send administrative information to you.</li>
                                <li>To protect our Services.</li>
                            </ul>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">4. Sharing Your Information</h3>
                            <p className="mb-4 text-slate-600">
                                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">5. Google & Zoom Data</h3>
                            <p className="mb-4 text-slate-600">
                                If you choose to link your Google or Zoom accounts, we access only the data necessary to facilitate logins and meeting scheduling (e.g., your email, name, and meeting snippets). We do not store your passwords or sensitive personal data from these services.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">6. Contact Us</h3>
                            <p className="mb-4 text-slate-600">
                                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@navigreat.com" className="text-blue-600 hover:underline">support@navigreat.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default AppPrivacy;
