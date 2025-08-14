// src/components/Layout.js
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import WelcomeFooter from './WelcomeFooter';

const Layout = ({ children }) => {
    return (
        <div className="page-wrapper">
            <WelcomeHeader />
            <main>
                {children}
            </main>
            <WelcomeFooter />
        </div>
    );
};

export default Layout;