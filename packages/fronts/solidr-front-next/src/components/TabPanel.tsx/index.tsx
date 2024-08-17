import React from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <div className="py-4 sm:py-8">{children}</div>}
        </div>
    );
}

type TabPanelButtonProps = {
    label: string;
    onClick: () => void;
    isActive: boolean;
};

export const TabPanelButton: React.FC<TabPanelButtonProps> = ({ label, onClick, isActive }) => {
    return (
        <button
            onClick={onClick}
            className={`min-h-[48px] px-4 py-2 text-md font-bold ${isActive
                ? 'text-customBlue border-b-3 border-customBlue'
                : 'text-gray-600 hover:text-customBlue'
                }`}
        >
            {label}
        </button>
    );
};

