import React from 'react';
import PageTransition from '../components/PageTransition';

const AppTerms = () => {
    return (
        <PageTransition>
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
                        <p className="text-slate-500 mb-8">Last Updated: January 07, 2026</p>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">1. Agreement to Terms</h3>
                            <p className="mb-4 text-slate-600">
                                These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and <strong>NaviGreat</strong> ("Company", “we”, “us”, or “our”),
                                concerning your access to and use of the <strong>NaviGreat</strong> website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">2. Intellectual Property Rights</h3>
                            <p className="mb-4 text-slate-600">
                                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">3. User Representations</h3>
                            <p className="mb-4 text-slate-600">
                                By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Use; (4) you are not a minor in the jurisdiction in which you reside.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">4. User Registration</h3>
                            <p className="mb-4 text-slate-600">
                                You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">5. Prohibited Activities</h3>
                            <p className="mb-4 text-slate-600">
                                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            </p>

                            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">6. Contact Us</h3>
                            <p className="mb-4 text-slate-600">
                                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:support@navigreat.com" className="text-blue-600 hover:underline">support@navigreat.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default AppTerms;
