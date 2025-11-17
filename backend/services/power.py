from __future__ import annotations

import threading
from dataclasses import dataclass


@dataclass
class PowerState:
    level: float
    charging: bool


class PowerGuard:
    def __init__(self):
        self._state: dict[int, PowerState] = {}
        self._lock = threading.Lock()

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

