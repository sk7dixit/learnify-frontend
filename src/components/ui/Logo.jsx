import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = '', size = 'md' }) => {
    const sizes = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-4xl'
    };

    return (
        <Link to="/" className={`font-bold tracking-tight flex items-center gap-2 ${sizes[size]} ${className}`}>
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full"></div>
                <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative text-cyan-400"
                >
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Ori<span className="text-white">Notes</span>
            </span>
        </Link>
    );
};

export default Logo;
