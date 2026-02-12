import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader, ArrowRight, Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
    const { token } = useParams();
    const { verifyEmail, resendVerification } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');
    const [countdown, setCountdown] = useState(3);
    const [redirectPath, setRedirectPath] = useState('/jobs');

    // Resend state
    const [resendEmail, setResendEmail] = useState('');
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [resendError, setResendError] = useState('');

    // Prevent multiple verification attempts
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verify = async () => {
            // Prevent multiple calls
            if (verificationAttempted.current) {
                console.log('Verification already attempted, skipping...');
                return;
            }

            if (!token) {
                console.error('No token provided in URL');
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            verificationAttempted.current = true;
            console.log('Starting email verification with token:', token.substring(0, 10) + '...');

            try {
                const response = await verifyEmail(token);
                console.log('Verification successful:', response);

                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in to your account.');

            } catch (err) {
                console.error('Verification error:', err);
                console.error('Error response:', err.response?.data);

                setStatus('error');
                setMessage(err.response?.data?.message || 'Email verification failed. The link may be expired or invalid.');
            }
        };

        verify();
    }, [token, navigate]);

    const handleResend = async () => {
        if (!resendEmail) {
            setResendError('Please enter your email address.');
            return;
        }

        setResending(true);
        setResendError('');
        setResendMessage('');

        try {
            const response = await resendVerification(resendEmail);
            setResendMessage(response.message || 'Verification email sent! Please check your inbox.');
        } catch (err) {
            setResendError(err.response?.data?.message || 'Failed to resend. Please try again later.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            Go to Login
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-red-600 mb-6">{message}</p>

                        {/* Resend Verification Section */}
                        <div className="w-full bg-gray-50 rounded-xl p-5 mb-6 text-left">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Resend Verification Email
                            </h3>
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
                            />
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                {resending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>

                            {resendMessage && (
                                <p className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded-lg">{resendMessage}</p>
                            )}
                            {resendError && (
                                <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{resendError}</p>
                            )}
                        </div>

                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
