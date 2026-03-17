import React from 'react';

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <div className="loading-screen fade-in">
            <div className="spinner-modern"></div>
            <p className="loading-text">{message}</p>
        </div>
    );
};

export default LoadingScreen;
