import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Header/Icon */}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${type === 'danger' ? 'bg-red-50 text-red-600' :
                                    type === 'success' ? 'bg-green-50 text-green-600' :
                                        'bg-blue-50 text-blue-600'
                                }`}>
                                {type === 'danger' ? <AlertCircle className="w-8 h-8" /> :
                                    type === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
                                        <AlertCircle className="w-8 h-8" />}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50/50 px-6 py-5 flex gap-3 justify-end border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-all duration-200"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-lg ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                                    type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' :
                                        'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
