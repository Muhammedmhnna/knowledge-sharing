import { CheckIcon, ShieldCheckIcon, LockClosedIcon, BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const PrivacySettingsStatic = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
                        Your Privacy Controls
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Manage how we collect, use, and protect your health information
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden divide-y divide-gray-200">
                    {/* Data Collection Section */}
                    <div className="p-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <LockClosedIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-900">Data Collection & Security</h2>
                                <p className="mt-1 text-gray-600">
                                    Control how your health data is collected and secured
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">Encrypted data storage</p>
                                    <p className="mt-1 text-gray-600">
                                        All your health information is encrypted using industry-standard protocols
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">Two-factor authentication</p>
                                    <p className="mt-1 text-gray-600">
                                        Extra security layer enabled for your account protection
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">Regular security audits</p>
                                    <p className="mt-1 text-gray-600">
                                        Our systems undergo frequent security testing to protect your data
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Communication Preferences */}
                    <div className="p-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <BellIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-900">Communication Preferences</h2>
                                <p className="mt-1 text-gray-600">
                                    Choose how we communicate with you about your health
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">Email notifications</p>
                                    <p className="mt-1 text-gray-600">
                                        Receive important health updates and appointment reminders
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-gray-300 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">SMS/text alerts</p>
                                    <p className="mt-1 text-gray-600">
                                        Get urgent notifications via text message (currently disabled)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">In-app messages</p>
                                    <p className="mt-1 text-gray-600">
                                        Important communications delivered within the application
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Sharing */}
                    <div className="p-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <EnvelopeIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-900">Data Sharing</h2>
                                <p className="mt-1 text-gray-600">
                                    Manage how your anonymized data contributes to health research
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">Research participation</p>
                                    <p className="mt-1 text-gray-600">
                                        Your anonymized data helps improve healthcare for everyone
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-gray-300 mt-1">
                                    <CheckIcon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-lg font-medium text-gray-900">Personalized advertising</p>
                                    <p className="mt-1 text-gray-600">
                                        Health-related product recommendations (currently disabled)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900">Need help with your privacy settings?</h3>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Our support team is available 24/7 to answer your questions about data privacy and security.
                    </p>
                    <div className="mt-6">
                        <a
                            href="mailto:privacy@healthhub.com"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Contact Privacy Team
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettingsStatic;