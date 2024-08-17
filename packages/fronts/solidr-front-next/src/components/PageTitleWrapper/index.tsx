import React from 'react';

export default ({ children }: { children?: React.ReactNode }) => {
    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-900 py-4 rounded-md">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex justify-between items-center">
                        {children}
                    </div>
                </div>
            </div>
            <hr className="my-4 border-gray-300 dark:border-gray-700" />
        </>
    );
};
