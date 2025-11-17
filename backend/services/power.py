from __future__ import annotations

import threading
import platform
from typing import Optional

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

from dataclasses import dataclass


@dataclass
class PowerState:
    level: float
    charging: bool


class PowerGuard:
    def __init__(self):
        self._state: dict[int, PowerState] = {}
        self._lock = threading.Lock()

    def get_system_battery(self) -> Optional[PowerState]:
        """Fetch real battery data from the system"""
        if not PSUTIL_AVAILABLE:
            return None
        
        try:
            if platform.system() == "Windows":
                # On Windows, use psutil's battery sensors
                battery = psutil.sensors_battery()
                if battery:
                    return PowerState(
                        level=battery.percent / 100.0,
                        charging=battery.power_plugged
                    )
            elif platform.system() == "Darwin":  # macOS
                # On macOS, use system_profiler
                import subprocess
                result = subprocess.run(
                    ["system_profiler", "SPPowerDataType", "-json"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    import json
                    data = json.loads(result.stdout)
                    power_info = data.get("SPPowerDataType", [])
                    if power_info:
                        battery_info = power_info[0].get("sppower_battery_health_info", {})
                        charge_info = power_info[0].get("sppower_ac_charger_info", {})
                        
                        # Get battery charge percentage
                        charge_remaining = battery_info.get("Charge Remaining", 100)
                        max_capacity = battery_info.get("Maximum Capacity", 100)
                        level = min(charge_remaining / max_capacity, 1.0) if max_capacity > 0 else 1.0
                        
                        # Check if charging
                        charging = charge_info.get("Connected", "No") == "Yes"
                        
                        return PowerState(level=level, charging=charging)
            elif platform.system() == "Linux":
                # On Linux, read from /sys/class/power_supply
                import os
                battery_path = None
                
                # Find battery directory
                for item in os.listdir("/sys/class/power_supply/"):
                    if "BAT" in item:
                        battery_path = f"/sys/class/power_supply/{item}"
                        break
                
                if battery_path and os.path.exists(battery_path):
                    # Read capacity (percentage)
                    capacity_file = f"{battery_path}/capacity"
                    status_file = f"{battery_path}/status"
                    
                    level = 1.0
                    charging = False
                    
                    if os.path.exists(capacity_file):
                        with open(capacity_file, 'r') as f:
                            capacity = f.read().strip()
                            try:
                                level = float(capacity) / 100.0
                            except ValueError:
                                level = 1.0
                    
                    if os.path.exists(status_file):
                        with open(status_file, 'r') as f:
                            status = f.read().strip()
                            charging = status.lower() in ["charging", "full"]
                    
                    return PowerState(level=level, charging=charging)
        except Exception as e:
            print(f"Error fetching battery data: {e}")
        
        return None

    def get_state(self, user_id: int) -> PowerState:
        # First try to get real system battery data
        system_battery = self.get_system_battery()
        if system_battery:
            # Update stored state with real data
            with self._lock:
                self._state[user_id] = system_battery
            return system_battery
        
        # Fallback to stored state or default
        with self._lock:
            return self._state.get(user_id, PowerState(level=1.0, charging=True))

    def update(self, user_id: int, level: float, charging: bool) -> PowerState:
        state = PowerState(level=level, charging=charging)
        with self._lock:
            self._state[user_id] = state
        return state

    def get(self, user_id: int) -> PowerState | None:
        with self._lock:
            return self._state.get(user_id)

    def can_backup(self, user_id: int) -> bool:
        state = self.get(user_id)
        if not state:
            return True
        if state.charging:
            return True
        return state.level >= 0.1

