import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button, { DeleteConfirmButton } from "./Button";

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
    const [t] = useTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-secondary rounded-lg p-6 mx-4 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700 animate-slideIn">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold  mb-2">
                        {title}
                    </h3>
                    <p >
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="px-6 py-2"
                    >
                        {cancelText || t("general.cancel")}
                    </Button>
                    <DeleteConfirmButton
                        variant="danger"
                        onClick={onConfirm}
                        className="px-6 py-2"
                    >
                        {confirmText || t("users.deleteChargeConfirm")}
                    </DeleteConfirmButton>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
