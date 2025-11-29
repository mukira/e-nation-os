#!/usr/bin/env python3
"""
E-Nation OS Build Monitor v5.0 - Ultimate Edition
Features: Speed Graph, System Stats, Notifications, Countdown
"""

import subprocess
import time
import os
import re
import sys
from datetime import datetime, timedelta
from collections import deque

# ANSI Colors & Control
RESET = "\033[0m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
WHITE = "\033[97m"
BOLD = "\033[1m"
DIM = "\033[2m"

# Screen control
CLEAR_SCREEN = "\033[2J"
MOVE_HOME = "\033[H"
HIDE_CURSOR = "\033[?25l"
SHOW_CURSOR = "\033[?25h"

class BuildMonitor:
    def __init__(self):
        self.current_target = 0
        self.total_targets = 0
        self.percent = 0.0
        self.elapsed_str = "00:00:00"
        self.remaining_str = "Calculating..."
        self.finish_time = "Calculating..."
        self.avg_time = 0.0
        self.current_action = "Initializing..."
        self.last_update = datetime.now()
        self.last_progress_time = time.time()  # For stall detection
        self.start_time = time.time()
        self.spinner_idx = 0
        self.spinner = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        self.first_draw = True
        
        # Graph data
        self.speed_history = deque(maxlen=60)
        self.graph_chars = "  ▂▃▄▅▆▇█"
        
        # System stats
        self.cpu_usage = 0.0
        self.ram_usage = 0.0
        self.last_sys_check = 0
        
        # Notifications
        self.last_notified_percent = 0
        self.stall_threshold = 600  # 10 minutes
        self.in_red_alert = False

    def trigger_siren(self):
        """Play loud alert sound"""
        # Play system beep and speak alert (non-blocking if possible, but simple here)
        subprocess.Popen("afplay /System/Library/Sounds/Sosumi.aiff", shell=True)
        subprocess.Popen("say 'Build Alert! Stalled!'", shell=True)

    def send_notification(self, title, message, sound="Glass"):
        """Send macOS desktop notification"""
        try:
            cmd = f"""osascript -e 'display notification "{message}" with title "{title}" sound name "{sound}"'"""
            subprocess.Popen(cmd, shell=True)
        except:
            pass

    def check_milestones(self):
        """Check and notify for 5% increments"""
        # Check for 5% increments
        current_milestone = int(self.percent / 5) * 5
        if current_milestone > self.last_notified_percent and current_milestone > 0:
            self.last_notified_percent = current_milestone
            self.send_notification(
                f"Build Progress: {current_milestone}%", 
                f"Reaching {current_milestone}% completion!",
                sound="Ping"
            )

    def update_system_stats(self):
        """Update CPU and RAM usage"""
        if time.time() - self.last_sys_check < 2.0:
            return
            
        try:
            cpu_cmd = "ps -A -o %cpu | awk '{s+=$1} END {print s}'"
            result = subprocess.run(cpu_cmd, shell=True, capture_output=True, text=True)
            if result.stdout.strip():
                self.cpu_usage = float(result.stdout.strip())
            
            ram_cmd = "ps -A -o %mem | awk '{s+=$1} END {print s}'"
            result = subprocess.run(ram_cmd, shell=True, capture_output=True, text=True)
            if result.stdout.strip():
                self.ram_usage = float(result.stdout.strip())
                
            self.last_sys_check = time.time()
        except:
            pass

    def get_speed_graph(self):
        """Generate ASCII graph of build speed"""
        if not self.speed_history:
            return ""
        max_speed = max(self.speed_history) if max(self.speed_history) > 0 else 1
        graph = ""
        for speed in self.speed_history:
            idx = int((speed / max_speed) * (len(self.graph_chars) - 1))
            graph += self.graph_chars[idx]
        return graph.ljust(60)

    def parse_log_line(self, line):
        """Parse a line from the build log"""
        # Check for progress to reset stall timer
        match = re.search(r'(\d+)\s*/\s*(\d+)\s+targets', line)
        if match:
            self.current_target = int(match.group(1))
            self.total_targets = int(match.group(2))
            self.last_update = datetime.now()
            self.last_progress_time = time.time() # Reset stall timer
            self.check_milestones()
        
        match = re.search(r'([\d.]+)%\s+complete', line)
        if match:
            self.percent = float(match.group(1))
        
        match = re.search(r'Avg time/target:\s+([\d.]+)s', line)
        if match:
            self.avg_time = float(match.group(1))
            if self.avg_time > 0:
                self.speed_history.append(1.0 / self.avg_time)
        
        match = re.search(r'Elapsed:\s+(.+?)(?:\n|$)', line)
        if match:
            self.elapsed_str = match.group(1).strip()
        
        match = re.search(r'Remaining:\s+(.+?)(?:\n|$)', line)
        if match:
            self.remaining_str = match.group(1).strip()
        
        match = re.search(r'Finish at:\s+(.+?)(?:\n|$)', line)
        if match:
            self.finish_time = match.group(1).strip()
        
        match = re.search(r'CXX\s+(.+)', line)
        if match:
            self.current_action = f"CXX {match.group(1)[:55]}"
            
        self.update_system_stats()

    def draw(self):
        """Draw the Ultimate UI"""
        # Check for stall/error
        time_since_progress = time.time() - self.last_progress_time
        self.in_red_alert = time_since_progress > self.stall_threshold
        
        # Color Scheme
        if self.in_red_alert:
            # RED ALERT MODE
            C_RESET = RED
            C_RED = RED
            C_GREEN = RED
            C_YELLOW = RED
            C_BLUE = RED
            C_MAGENTA = RED
            C_CYAN = RED
            C_WHITE = RED
            C_BOLD = BOLD
            C_DIM = ""
            self.trigger_siren() # SIREN!
            status_msg = f"{BOLD}🚨 CRITICAL STALL DETECTED ({int(time_since_progress)}s) 🚨{RESET}"
        else:
            # Normal Mode
            C_RESET = RESET
            C_RED = RED
            C_GREEN = GREEN
            C_YELLOW = YELLOW
            C_BLUE = BLUE
            C_MAGENTA = MAGENTA
            C_CYAN = CYAN
            C_WHITE = WHITE
            C_BOLD = BOLD
            C_DIM = DIM
            status_msg = f"  {self.spinner[self.spinner_idx % len(self.spinner)]} {C_BOLD}BUILDING{C_RESET}"

        remaining_targets = self.total_targets - self.current_target if self.total_targets > 0 else 0
        speed = 1.0 / self.avg_time if self.avg_time > 0 else 0.0
        speed_per_min = speed * 60
        
        # Health
        if self.in_red_alert:
            health_emoji = "💀"
            health_text = "CRITICAL"
            health_color = C_RED
        elif self.avg_time < 1.0:
            health_emoji = "🟢"
            health_text = "Excellent"
            health_color = C_GREEN
        elif self.avg_time < 2.0:
            health_emoji = "🟡"
            health_text = "Good"
            health_color = C_YELLOW
        else:
            health_emoji = "🔴"
            health_text = "Slow"
            health_color = C_RED
            
        # Progress bar
        bar_width = 55
        filled = int(self.percent / 100 * bar_width) if self.percent > 0 else 0
        bar = "█" * filled + "░" * (bar_width - filled)
        bar_color = C_GREEN if self.percent > 80 else (C_YELLOW if self.percent > 50 else C_CYAN)
        if self.in_red_alert: bar_color = C_RED
        
        self.spinner_idx += 1
        
        lines = []
        
        # Header
        lines.append(f"{C_CYAN}{C_BOLD}╔═════════════════════════════════════════════════════════════════════╗{C_RESET}")
        lines.append(f"{C_CYAN}{C_BOLD}║           E-NATION OS ULTIMATE MONITOR v5.1                         ║{C_RESET}")
        lines.append(f"{C_CYAN}{C_BOLD}╚═════════════════════════════════════════════════════════════════════╝{C_RESET}")
        lines.append("")
        
        # Status & System Stats
        current_time = datetime.now().strftime('%I:%M:%S %p')
        lines.append(f"{status_msg}  │  {C_CYAN}⏰ {current_time}{C_RESET}  │  {C_MAGENTA}CPU: {self.cpu_usage:>5.1f}%{C_RESET}  │  {C_MAGENTA}RAM: {self.ram_usage:>4.1f}%{C_RESET}")
        lines.append("")
        
        # Progress
        lines.append(f"{C_BOLD}┌─ 📊 PROGRESS ───────────────────────────────────────────────────────┐{C_RESET}")
        lines.append(f"│                                                                      │")
        lines.append(f"│  {C_CYAN}Current:{C_RESET}     {C_WHITE}{self.current_target:>7,}{C_RESET} / {C_WHITE}{self.total_targets:>7,}{C_RESET} targets                    │")
        lines.append(f"│  {C_CYAN}Complete:{C_RESET}    {C_WHITE}{self.percent:>10.5f}{C_RESET} %                                      │")
        lines.append(f"│  {C_CYAN}Remaining:{C_RESET}   {C_WHITE}{remaining_targets:>7,}{C_RESET} targets                              │")
        lines.append(f"│                                                                      │")
        lines.append(f"│  [{bar_color}{bar}{C_RESET}]  │")
        lines.append(f"│                                                                      │")
        lines.append(f"{C_BOLD}└──────────────────────────────────────────────────────────────────────┘{C_RESET}")
        lines.append("")
        
        # Speed Graph
        lines.append(f"{C_BOLD}┌─ 📈 SPEED GRAPH (Last 60s) ─────────────────────────────────────────┐{C_RESET}")
        lines.append(f"│                                                                      │")
        graph = self.get_speed_graph()
        lines.append(f"│  {C_GREEN}{graph}{C_RESET}      │")
        lines.append(f"│                                                                      │")
        lines.append(f"{C_BOLD}└──────────────────────────────────────────────────────────────────────┘{C_RESET}")
        lines.append("")
        
        # Performance & Time
        lines.append(f"{C_BOLD}┌─ ⚡ METRICS & TIME ─────────────────────────────────────────────────┐{C_RESET}")
        lines.append(f"│                                                                      │")
        lines.append(f"│  {C_CYAN}Speed:{C_RESET}       {C_WHITE}{speed:>8.5f}{C_RESET} t/s ({speed_per_min:>6.1f} t/m)    {C_CYAN}Elapsed:{C_RESET}   {C_WHITE}{self.elapsed_str:<12}{C_RESET}   │")
        lines.append(f"│  {C_CYAN}Avg Time:{C_RESET}    {C_WHITE}{self.avg_time:>8.5f}{C_RESET} s/target          {C_CYAN}Left:{C_RESET}      {C_WHITE}{self.remaining_str:<12}{C_RESET}   │")
        lines.append(f"│  {C_CYAN}Health:{C_RESET}      {health_color}{health_emoji} {health_text:<15}{C_RESET}           {C_CYAN}Finish:{C_RESET}    {C_WHITE}{self.finish_time:<12}{C_RESET}   │")
        lines.append(f"│                                                                      │")
        lines.append(f"{C_BOLD}└──────────────────────────────────────────────────────────────────────┘{C_RESET}")
        lines.append("")
        
        # Currently Building
        lines.append(f"{C_BOLD}┌─ 🔨 CURRENTLY BUILDING ─────────────────────────────────────────────┐{C_RESET}")
        lines.append(f"│                                                                      │")
        action_display = self.current_action[:66].ljust(66)
        lines.append(f"│  {C_DIM}{action_display}{C_RESET}  │")
        lines.append(f"│                                                                      │")
        lines.append(f"{C_BOLD}└──────────────────────────────────────────────────────────────────────┘{C_RESET}")
        lines.append("")
        
        # Footer
        lines.append(f"{C_DIM}{'─' * 72}{C_RESET}")
        lines.append(f"  {C_CYAN}Press Ctrl+C to exit{C_RESET}  │  {C_YELLOW}🔔 5% Pings Active{C_RESET}  │  {C_RED}🚨 Red Alert Active{C_RESET}")
        lines.append(f"{C_DIM}{'─' * 72}{C_RESET}")
        
        output_str = "\n".join(lines)
        if self.first_draw:
            sys.stdout.write(CLEAR_SCREEN)
            self.first_draw = False
        sys.stdout.write(MOVE_HOME + output_str)
        sys.stdout.flush()

def main():
    sys.stdout.write(CLEAR_SCREEN)
    sys.stdout.write(HIDE_CURSOR)
    sys.stdout.flush()
    
    print(f"{CYAN}Starting E-Nation OS Ultimate Monitor v5.1...{RESET}")
    
    # Process check
    pid = None
    try:
        result = subprocess.run(["pgrep", "-f", "unstoppable_build.py"], capture_output=True, text=True)
        if result.stdout.strip():
            pid = result.stdout.strip().split()[0]
            print(f"{GREEN}✅ Build Agent is active (PID: {pid}){RESET}")
        if not pid:
            result = subprocess.run(["pgrep", "-f", "ninja"], capture_output=True, text=True)
            if result.stdout.strip():
                pid = result.stdout.strip().split()[0]
                print(f"{GREEN}✅ Ninja is active (PID: {pid}){RESET}")
    except:
        pass
    
    log_file = "build_ultra_reliable.log"
    if not os.path.exists(log_file):
        print(f"{RED}❌ Log file not found: {log_file}{RESET}")
        return
    
    print(f"{CYAN}📊 Monitoring: {log_file}{RESET}")
    print(f"{DIM}Loading Ultimate Dashboard...{RESET}\n")
    time.sleep(1)
    
    monitor = BuildMonitor()
    proc = subprocess.Popen(["tail", "-f", "-n", "100", log_file], stdout=subprocess.PIPE, text=True, bufsize=1)
    
    try:
        while True:
            line = proc.stdout.readline()
            if line:
                monitor.parse_log_line(line)
                if "Regenerating ninja files" in line or "Regenerating ninja files" in monitor.current_action:
                    monitor.current_action = "🔨 Regenerating build files (this takes a moment)..."
                    monitor.remaining_str = "Configuring..."
                    monitor.finish_time = "Please wait..."
            monitor.draw()
            time.sleep(0.3)
    except KeyboardInterrupt:
        sys.stdout.write(SHOW_CURSOR)
        sys.stdout.write(f"\n{CYAN}👋 Monitor stopped{RESET}\n")
        sys.stdout.flush()
        proc.kill()
    finally:
        sys.stdout.write(SHOW_CURSOR)
        sys.stdout.flush()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        sys.stdout.write(SHOW_CURSOR)
        sys.stdout.flush()
        print(f"{RED}Error: {e}{RESET}")
        sys.exit(1)
