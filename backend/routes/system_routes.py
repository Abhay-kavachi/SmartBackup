from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import psutil
import platform
from datetime import datetime

system_bp = Blueprint("system", __name__)

@system_bp.get("/processes")
@system_bp.get("/processes/")
@jwt_required()
def get_processes():
    """Get running processes with resource usage"""
    try:
        print("DEBUG: Getting processes...")
        user_id = int(get_jwt_identity())
        print(f"DEBUG: User ID: {user_id}")
        processes = []
        
        # Get all running processes
        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 
                                        'memory_percent', 'status', 'create_time']):
            try:
                # Filter processes by current user on Windows
                if platform.system() == "Windows":
                    import getpass
                    current_user = getpass.getuser().lower()
                    proc_username = proc.info.get('username', '')
                    if proc_username and current_user not in proc_username.lower():
                        continue
                
                # Calculate CPU percentage (0 if not available)
                cpu_percent = proc.info.get('cpu_percent', 0) or 0
                memory_percent = proc.info.get('memory_percent', 0) or 0
                
                # Only include processes with significant resource usage
                if cpu_percent > 0.1 or memory_percent > 0.1:
                    processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'] or 'Unknown',
                        'username': proc.info.get('username', ''),
                        'cpu_percent': round(cpu_percent, 1),
                        'memory_percent': round(memory_percent, 1),
                        'memory_mb': round(proc.memory_info().rss / 1024 / 1024, 1),
                        'status': proc.info['status'],
                        'started_at': datetime.fromtimestamp(proc.info['create_time']).isoformat()
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        # Sort by CPU usage (descending)
        processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
        
        print(f"DEBUG: Found {len(processes)} processes")
        
        # Return top 20 processes
        return jsonify({
            'processes': processes[:20],
            'total_processes': len(processes)
        })
    except Exception as e:
        print(f"DEBUG: Error in get_processes: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@system_bp.get("/stats")
@system_bp.get("/stats/")
@jwt_required()
def get_system_stats():
    """Get overall system statistics"""
    try:
        user_id = int(get_jwt_identity())
        
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage (use current drive on Windows)
        if platform.system() == "Windows":
            import os
            disk = psutil.disk_usage(os.getcwd())
        else:
            disk = psutil.disk_usage('/')
        
        # Network I/O
        network = psutil.net_io_counters()
        
        # Boot time
        boot_time = datetime.fromtimestamp(psutil.boot_time()).isoformat()
        
        return jsonify({
            'cpu': {
                'percent': cpu_percent,
                'count': cpu_count
            },
            'memory': {
                'total': round(memory.total / 1024 / 1024 / 1024, 2),
                'available': round(memory.available / 1024 / 1024 / 1024, 2),
                'percent': memory.percent,
                'used': round(memory.used / 1024 / 1024 / 1024, 2)
            },
            'disk': {
                'total': round(disk.total / 1024 / 1024 / 1024, 2),
                'used': round(disk.used / 1024 / 1024 / 1024, 2),
                'free': round(disk.free / 1024 / 1024 / 1024, 2),
                'percent': round((disk.used / disk.total) * 100, 2)
            },
            'network': {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv
            },
            'boot_time': boot_time
        })
        
    except Exception as e:
        print(f"Error fetching system stats: {e}")
        return jsonify({'error': 'Failed to fetch system stats'}), 500
