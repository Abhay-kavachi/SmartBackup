import { useEffect, useState } from "react";
import api from "../api/client";

type BatteryState = {
  level: number;
  charging: boolean;
};

const defaultState: BatteryState = { level: 1, charging: true };

export const useBattery = () => {
  const [state, setState] = useState<BatteryState>(defaultState);

  useEffect(() => {
    let mounted = true;

    const syncState = async (battery: BatteryManager) => {
      if (!mounted) return;
      const nextState = { level: battery.level, charging: battery.charging };
      setState(nextState);
      try {
        await api.post(
          "/power/state",
          { level: battery.level, charging: battery.charging },
          { timeout: 3000 },
        );
      } catch {
        // ignore
      }
    };

    const init = async () => {
      if (!("getBattery" in navigator)) return;
      const battery = await (navigator as any).getBattery();
      await syncState(battery);
      battery.addEventListener("levelchange", () => syncState(battery));
      battery.addEventListener("chargingchange", () => syncState(battery));
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
};

