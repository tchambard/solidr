import React, { Fragment } from 'react';
import * as _ from 'lodash';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/solid';

export interface IActionMenuItem {
    title: string;
    icon: React.ReactNode;
    hidden?: boolean;
    description?: string;
    onClick: () => void;
}

interface IProps {
    items: IActionMenuItem[];
}

const ActionMenu: React.FC<IProps> = ({ items }) => {
    return (<>
        <div className="relative inline-block text-left">
            <Menu as="div" className="relative">
                <div>
                    <MenuButton className="inline-flex justify-center items-center p-2 rounded-md focus:outline-none focus:ring-0">
                        <Bars3Icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white" aria-hidden="true" />
                    </MenuButton>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <MenuItems className="z-10 absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black dark:ring-white ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            {_.compact(
                                _.map(items, (item, idx) => {
                                    if (!item.hidden) {
                                        return (
                                            <MenuItem key={`menu-item-${idx}`}>
                                                {({ focus }) => (
                                                    <button
                                                        type="button"
                                                        className={`${focus ? 'bg-zinc-100 dark:bg-zinc-700' : ''} group flex items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 w-full text-left`}
                                                        onClick={item.onClick}
                                                    >
                                                        <span className="flex-shrink-0">{item.icon}</span>
                                                        <span className="ml-2">{item.title}</span>
                                                    </button>
                                                )}
                                            </MenuItem>
                                        );
                                    }
                                })
                            )}
                        </div>
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    </>);
};

export default ActionMenu;
