import { useLocation } from 'react-router-dom';

export const useHashParams = () => {
    const { hash } = useLocation();
    const params = new URLSearchParams(hash.slice(1));
    return Object.fromEntries(params.entries());
};