import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
    label,
    error,
    options = [],
    className = '',
    containerClassName = '',
    placeholder = 'Select an option',
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
                <select
                    className={`glass-input w-full rounded-xl py-3 pl-4 pr-10 text-slate-100 appearance-none cursor-pointer ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
                    {...props}
                >
                    <option value="" className="bg-slate-800 text-slate-400">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value || opt} value={opt.value || opt} className="bg-slate-800 text-slate-100">
                            {opt.label || opt}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-cyan-400 transition-colors">
                    <ChevronDown size={20} />
                </div>
            </div>
            {error && (
                <span className="text-xs text-red-400 ml-1 animate-fade-in-up">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Select;
