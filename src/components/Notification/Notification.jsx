import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import './Notification.css';

const Notification = ({ 
  type = 'success',
  title, 
  message, 
  onConfirm, 
  onCancel,
  showActions = false 
}) => {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircle />;
      case 'warning':
        return <AlertCircle />;
      default:
        return <AlertCircle />;
    }
  };

  // For confirmation dialogs (with actions), show in center
  if (showActions) {
    return (
      <div className="notification-overlay">
        <div className="notification-container">
          <div className="notification-content">
            <div className={`notification-icon ${type}`}>
              {getIcon()}
            </div>
            <div className="notification-body">
              <h5 className="notification-title">
                {title}
              </h5>
              <p className="notification-message">
                {message}
              </p>
              <div className="notification-actions">
                <button
                  onClick={onCancel}
                  className="notification-button cancel"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="notification-button confirm"
                >
                  Oke
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For toast notifications (without actions), show in top-right
  return (
    <div className="notification-toast">
      <div className={`notification-container ${type}`}>
        <button 
          onClick={onCancel}
          className="notification-close"
        >
          <X />
        </button>
        <div className="notification-content">
          <div className={`notification-icon ${type}`}>
            {getIcon()}
          </div>
          <div className="notification-body">
            <h5 className="notification-title">
              {title}
            </h5>
            <p className="notification-message">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;