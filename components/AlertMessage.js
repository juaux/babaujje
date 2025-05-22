import React from 'react';

const AlertMessage = ({ message, severity }) => {
  return (
    <div className={`mb-4 p-4 rounded ${
      severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    }`}>
      {message}
    </div>
  );
};

export default AlertMessage;