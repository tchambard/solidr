import React from 'react';

export default ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="py-4">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex justify-between items-center">
                    {children}
                </div>
            </div>
        </div>
    );
};
