    import React, { createContext, useContext, useState } from 'react';
    import './ConfirmationModal.css';

    // Context for the confirmation modal
    const ConfirmationContext = createContext();

    // Custom hook to use the confirmation modal
    export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within ConfirmationProvider');
    }
    return context;
    };

    // Modal component
    const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, type }) => {
    if (!isOpen) return null;

    const getTypeClass = () => {
        switch (type) {
        case 'danger':
            return 'modal-danger';
        case 'warning':
            return 'modal-warning';
        case 'success':
            return 'modal-success';
        case 'error':
            return 'modal-error';
        default:
            return 'modal-default';
        }
    };

    const getIcon = () => {
        switch (type) {
        case 'danger':
            return '⚠️';
        case 'warning':
            return '⚠️';
        case 'success':
            return '✓';
        case 'error':
            return '✕';
        default:
            return '?';
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
        <div className={`modal-container ${getTypeClass()}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
            {/* Icon */}
            <div className={`modal-icon ${getTypeClass()}`}>
                <span>{getIcon()}</span>
            </div>
            
            {/* Title */}
            <h3 className="modal-title">{title}</h3>
            
            {/* Message */}
            <p className="modal-message">{message}</p>
            
            {/* Buttons */}
            <div className="modal-buttons">
                {cancelText && (
                <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
                    {cancelText}
                </button>
                )}
                <button className={`modal-btn modal-btn-confirm ${getTypeClass()}`} onClick={onConfirm}>
                {confirmText}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    };

    // Provider component
    export const ConfirmationProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'default',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const showConfirmation = ({
        title = 'Confirm Action',
        message = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'default',
        onConfirm = () => {},
        onCancel = () => {}
    }) => {
        return new Promise((resolve) => {
        setModal({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText,
            type,
            onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }));
            onConfirm();
            resolve(true);
            },
            onCancel: () => {
            setModal(prev => ({ ...prev, isOpen: false }));
            onCancel();
            resolve(false);
            }
        });
        });
    };

    // New showError function for displaying errors
    const showError = ({
        title = 'Error',
        message = 'Something went wrong',
        confirmText = 'OK',
        onConfirm = () => {}
    }) => {
        return new Promise((resolve) => {
        setModal({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText: null, // Hide cancel button for error messages
            type: 'error',
            onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }));
            onConfirm();
            resolve(true);
            },
            onCancel: () => {} // No cancel function for errors
        });
        });
    };

    // New showSuccess function for displaying success messages
    const showSuccess = ({
        title = 'Success',
        message = 'Operation completed successfully',
        confirmText = 'OK',
        onConfirm = () => {}
    }) => {
        return new Promise((resolve) => {
        setModal({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText: null, // Hide cancel button for success messages
            type: 'success',
            onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }));
            onConfirm();
            resolve(true);
            },
            onCancel: () => {} // No cancel function for success messages
        });
        });
    };

    const hideConfirmation = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmationContext.Provider value={{ showConfirmation, showError, showSuccess, hideConfirmation }}>
        {children}
        <ConfirmationModal {...modal} />
        </ConfirmationContext.Provider>
    );
    };

    // Demo component showing how to use it
    const ConfirmationDemo = () => {
    const { showConfirmation, showError, showSuccess } = useConfirmation();
    const [lastAction, setLastAction] = useState('');

    const handleDelete = async () => {
        const confirmed = await showConfirmation({
        title: 'Delete Item',
        message: 'This action cannot be undone. Are you sure you want to delete this item?',
        confirmText: 'Delete',
        cancelText: 'Keep',
        type: 'danger',
        onConfirm: () => setLastAction('✅ Deleted successfully!'),
        onCancel: () => setLastAction('❌ Deletion cancelled')
        });
    };

    const handleSave = async () => {
        const confirmed = await showConfirmation({
        title: 'Save Changes',
        message: 'Do you want to save your changes before leaving?',
        confirmText: 'Save',
        cancelText: 'Discard',
        type: 'success',
        onConfirm: () => setLastAction('✅ Changes saved!'),
        onCancel: () => setLastAction('🗑️ Changes discarded')
        });
    };

    const handleWarning = async () => {
        const confirmed = await showConfirmation({
        title: 'Potential Data Loss',
        message: 'This operation might cause data loss. Please backup your data first.',
        confirmText: 'Continue Anyway',
        cancelText: 'Go Back',
        type: 'warning',
        onConfirm: () => setLastAction('⚠️ Proceeded with warning!'),
        onCancel: () => setLastAction('🛡️ Stayed safe')
        });
    };

    const handleError = async () => {
        await showError({
        title: 'Connection Failed',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        confirmText: 'Try Again',
        onConfirm: () => setLastAction('🔄 Will try again!')
        });
    };

    const handleSuccess = async () => {
        await showSuccess({
        title: 'Assignment Created!',
        message: 'Your assignment has been successfully created and is now available to students.',
        confirmText: 'Great!',
        onConfirm: () => setLastAction('🎉 Success acknowledged!')
        });
    };

    return (
        <div className="demo-container">
        <h1 className="demo-title">🎉 Custom Confirmation Modal</h1>
        <p className="demo-subtitle">Say goodbye to ugly browser alerts!</p>
        
        <div className="demo-buttons">
            <button className="demo-btn demo-btn-danger" onClick={handleDelete}>
            🗑️ Delete Something (Danger)
            </button>
            
            <button className="demo-btn demo-btn-success" onClick={handleSave}>
            💾 Save Changes (Success)
            </button>
            
            <button className="demo-btn demo-btn-warning" onClick={handleWarning}>
            ⚠️ Risky Operation (Warning)
            </button>

            <button className="demo-btn demo-btn-error" onClick={handleError}>
            ❌ Show Error Message
            </button>

            <button className="demo-btn demo-btn-success" onClick={handleSuccess}>
            ✅ Show Success Message
            </button>
        </div>

        {lastAction && (
            <div className="demo-result">
            <p>Last Action: {lastAction}</p>
            </div>
        )}
        </div>
    );
    };

    // Main App component with provider
    const App = () => {
    return (
        <ConfirmationProvider>
            <ConfirmationDemo />
        </ConfirmationProvider>
    );
    };

    export default App;