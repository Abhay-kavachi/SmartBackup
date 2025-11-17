import { useEffect, useRef } from "react";
export const usePolling = (callback, interval, deps = []) => {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback, ...deps]);
    useEffect(() => {
        let id = null;
        let active = true;
        const tick = async () => {
            if (!active)
                return;
            await savedCallback.current();
            id = window.setTimeout(tick, interval);
        };
        id = window.setTimeout(tick, interval);
        return () => {
            active = false;
            if (id)
                window.clearTimeout(id);
        };
    }, [interval]);
};
