type BatteryManager = {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: (event: "levelchange" | "chargingchange", handler: () => void) => void;
  removeEventListener: (event: "levelchange" | "chargingchange", handler: () => void) => void;
};

interface Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

