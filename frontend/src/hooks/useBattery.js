import { useEffect, useState } from "react";
import api from "../api/client";

const defaultState = { level: 0, charging: false };

export const useBattery = () => {
    const [state, setState] = useState(defaultState);

    useEffect(() => {
        let mounted = true;

        // Fetch state from backend
        const fetchBackendState = async () => {
            try {
                const { data } = await api.get("/power/state");
                if (mounted && data.state) {
                    setState({
                        level: data.state.level,
                        charging: data.state.charging
                    });
                }
            } catch (err) {
                console.error("Failed to fetch power state:", err);
                // Keep default state if backend fails
            }
        };

        // Initial fetch
        fetchBackendState();

        // Poll every 2 seconds for real-time updates
        const interval = setInterval(fetchBackendState, 2000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return state;
};
