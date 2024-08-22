import React from 'react';

export default ({ children }: { children?: React.ReactNode }) => {
    return (
        <>
            <div className="bg-zinc-50 dark:bg-zinc-900 py-4 rounded-lg">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex justify-between items-center">
                        {children}
                    </div>
                </div>
            </div>
            <hr className="my-4 border-zinc-300 dark:border-zinc-700" />
        </>
    );
};
