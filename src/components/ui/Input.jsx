import React from 'react';

const Input = ({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-sm font-medium text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    className={`glass-input w-full rounded-xl py-3 ${Icon ? 'pl-12' : 'pl-4'} pr-4 text-slate-100 placeholder-slate-500 ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-400 ml-1 animate-fade-in-up">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
