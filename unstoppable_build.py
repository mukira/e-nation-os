#!/usr/bin/env python3
"""
Force-Resume Build Agent v2.0
- Detects stalls (5 min no progress)
- RESUMES from last successful step
- Advanced Real-time Monitor with ETA
- Visual & Audio Alerts
"""

import subprocess
import time
import os
import re
import sys
import shutil
from datetime import datetime, timedelta
from collections import deque

# ANSI Colors
RESET = "\033[0m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
PURPLE = "\033[95m"
CYAN = "\033[96m"
BOLD = "\033[1m"
CLEAR_SCREEN = "\033[2J\033[H"

class BuildMonitor:
    def __init__(self, total_targets=0):
        self.start_time = time.time()
        self.total_targets = total_targets
        self.current_target = 0
        self.last_target = 0
        self.recent_times = deque(maxlen=100)
        self.last_target_time = None
        self.avg_time_per_target = 0.0
        self.current_action = ""
        self.status = "BUILDING"
        self.health = "Good"
        self.spinner_idx = 0
        self.spinner_chars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"

    def update(self, line):
        # Parse Ninja output: [123/456] CXX obj/...
        match = re.search(r'\[(\d+)/(\d+)\]\s+(.*)', line)
        if match:
            self.current_target = int(match.group(1))
            self.total_targets = int(match.group(2))
            self.current_action = match.group(3)[:50]  # Truncate
            
            # Calculate stats
            if self.current_target > self.last_target:
                now = time.time()
                if self.last_target_time is not None:
                    self.recent_times.append(now - self.last_target_time)
                self.last_target_time = now

                if self.recent_times:
                    self.avg_time_per_target = sum(self.recent_times) / len(self.recent_times)
                
                self.last_target = self.current_target

    def get_eta(self):
        if self.avg_time_per_target <= 0 or self.total_targets == 0:
            return "Calculating..."
        
        remaining = self.total_targets - self.current_target
        # Recalculate avg based on total elapsed
        elapsed = time.time() - self.start_time
        if self.current_target > 0:
            real_avg = elapsed / self.current_target
            seconds_left = remaining * real_avg
            return str(timedelta(seconds=int(seconds_left)))
        return "Calculating..."

    def get_finish_time(self):
        if self.avg_time_per_target <= 0 or self.total_targets == 0:
            return "Calculating..."
        
        remaining = self.total_targets - self.current_target
        elapsed = time.time() - self.start_time
        if self.current_target > 0:
            real_avg = elapsed / self.current_target
            seconds_left = remaining * real_avg
            finish_time = datetime.now() + timedelta(seconds=int(seconds_left))
            return finish_time.strftime("%I:%M:%S %p")
        return "Calculating..."

    def draw(self, stalled=False):
        # Move cursor to top
        print(CLEAR_SCREEN, end="")
        
        elapsed = str(timedelta(seconds=int(time.time() - self.start_time)))
        percent = (self.current_target / self.total_targets * 100) if self.total_targets > 0 else 0
        
        # Header
        color = RED if stalled else CYAN
        print(f"{color}╔═══════════════════════════════════════════════════╗{RESET}")
        if stalled:
            print(f"{color}║          🚨 BUILD ISSUE DETECTED! 🚨             ║{RESET}")
        else:
            print(f"{color}║          E-NATION OS BUILD MONITOR v2.0           ║{RESET}")
        print(f"{color}╚═══════════════════════════════════════════════════╝{RESET}")
        print()
        
        # Status
        spinner = self.spinner_chars[self.spinner_idx % len(self.spinner_chars)]
        self.spinner_idx += 1
        print(f"{BOLD}{spinner} {self.status}  │  ⏰ {datetime.now().strftime('%I:%M:%S %p')}{RESET}")
        print()
        
        # Progress
        print(f"{BOLD}📊 Progress:{RESET}")
        print(f"   {self.current_target} / {self.total_targets} targets")
        print(f"   {percent:.4f}% complete")
        print()
        
        # Progress Bar
        bar_width = 50
        filled = int(percent / 100 * bar_width)
        bar = "█" * filled + "░" * (bar_width - filled)
        print(f"   [{color}{bar}{RESET}]")
        print()
        
        # Stats
        print(f"{BOLD}📈 Statistics:{RESET}")
        avg = (time.time() - self.start_time) / self.current_target if self.current_target > 0 else 0
        print(f"   Avg time/target: {avg:.2f}s")
        print(f"   ⏱  Elapsed:   {elapsed}")
        print(f"   ⏱  Remaining: {self.get_eta()}")
        print(f"   🎯 Finish at: {self.get_finish_time()}")
        print()
        
        # Current Action
        print(f"{BOLD}🔨 Currently Building:{RESET}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"   {self.current_action}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()
        
        # Health
        health_color = GREEN
        if avg > 1.0: health_color = YELLOW
        if stalled: health_color = RED
        print(f"{BOLD}💊 Build Health: {health_color}● {self.health}{RESET}")
        
        if stalled:
            print()
            print(f"{RED}{BOLD}ERROR TYPE: Build Stalled (no progress for 5 minutes){RESET}")
            print(f"{RED}AUTO-RESUMING BUILD IN 5 SECONDS...{RESET}")
            # Sound alert
            sys.stdout.write('\a')
            sys.stdout.flush()

class ForceResumeBuildAgent:
    def __init__(self):
        self.build_dir = os.path.expanduser("~/chromium/src")
        self.out_dir = f"{self.build_dir}/out/Release"
        self.status_file = "agent_status.txt"
        self.log_file = "build_ultra_reliable.log"
        self.stall_timeout = 1200  # 20 minutes (increased for regeneration)
        self.last_progress = time.time()
        self.last_target_count = 0
        self.retry_count = 0
        self.max_retries = 100 # Never give up basically
        self.build_process = None
        self.monitor = BuildMonitor()
        
    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        # Only print to file, screen is owned by monitor
        with open(self.log_file, "a") as f:
            f.write(log_msg + "\n")
            
    def update_status(self, status, details=""):
        with open(self.status_file, "w") as f:
            f.write(f"Status: {status}\n")
            f.write(f"Time: {datetime.now()}\n")
            f.write(f"Resume: {self.retry_count}/{self.max_retries}\n")
            f.write(f"Last Target: {self.last_target_count}\n")
            if details:
                f.write(f"Details: {details}\n")
    
    def detect_stall(self, output_line):
        """Check if build has stalled (no progress for 5 minutes)"""
        # Look for ninja progress: [1234/5678]
        match = re.search(r'\[(\d+)/(\d+)\]', output_line)
        if match:
            current_count = int(match.group(1))
            if current_count > self.last_target_count:
                self.last_target_count = current_count
                self.last_progress = time.time()
                self.monitor.health = "Good"
                return False
        
        # Check if stalled
        elapsed = time.time() - self.last_progress
        if elapsed > self.stall_timeout:
            self.log(f"⚠️ STALL DETECTED: No progress for {int(elapsed)}s at target {self.last_target_count}")
            self.monitor.health = "Stalled"
            return True
        return False
    
    def force_resume_build(self):
        """Resume build from last successful target (doesn't start over!)"""
        os.chdir(self.build_dir)
        
        # Set environment
        os.environ['PATH'] = f"{os.environ.get('PATH')}:{os.path.expanduser('~/depot_tools')}"
        os.environ.setdefault('JOBS', '14')
        
        # Increase limits
        subprocess.run(["ulimit", "-n", "10000"], shell=True)
        subprocess.run(["ulimit", "-v", "unlimited"], shell=True)
        
        self.log(f"🔄 RESUMING build (attempt {self.retry_count + 1}/{self.max_retries})")
        self.update_status("RESUMING")
        
        cmd = ["ninja", "-C", self.out_dir, "chrome"]
        
        self.build_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        return self.build_process
    
    def monitor_build(self):
        """Monitor build and handle stalls/failures"""
        last_line = ""
        
        while True:
            # Non-blocking read would be better, but readline is okay for now
            line = self.build_process.stdout.readline()
            
            if not line:
                # Build process ended
                returncode = self.build_process.wait()
                if returncode == 0:
                    self.log("✅ BUILD SUCCESSFUL!")
                    self.update_status("SUCCESS")
                    return True
                else:
                    self.log(f"❌ Build exited with code {returncode}")
                    return False
            
            clean_line = line.strip()
            if clean_line:
                self.monitor.update(clean_line)
                last_line = clean_line
            
            # Update UI
            self.monitor.draw()
            
            # Check for stall
            if self.detect_stall(line):
                self.monitor.draw(stalled=True)
                self.log("⚠️ Stall detected - will kill and RESUME...")
                # Play sound
                os.system('tput bel') 
                time.sleep(2) # Let user see the red screen
                self.build_process.kill()
                self.build_process.wait()
                return False
            
            # Check for fatal errors
            if "FAILED:" in line:
                self.log(f"❌ Build error: {line.strip()}")
                self.monitor.status = "ERROR"
                self.monitor.draw(stalled=True)
                os.system('tput bel')
                # Don't immediately kill - let ninja try to continue or fail
    
    def run_force_resume_until_done(self):
        """Main loop - resumes build until success"""
        self.log("=" * 70)
        self.log("🔄 FORCE-RESUME BUILD AGENT ACTIVATED")
        self.log("=" * 70)
        
        while self.retry_count < self.max_retries:
            try:
                # Resume build
                self.force_resume_build()
                
                # Monitor build
                success = self.monitor_build()
                
                if success:
                    self.log("🎉 BUILD COMPLETED SUCCESSFULLY!")
                    return True
                
                # Build failed or stalled
                self.retry_count += 1
                self.monitor.status = "RESUMING..."
                self.monitor.draw(stalled=True)
                
                if self.retry_count >= self.max_retries:
                    break
                
                time.sleep(5)
                
            except KeyboardInterrupt:
                self.log("❌ Interrupted by user")
                if self.build_process:
                    self.build_process.kill()
                return False
            except Exception as e:
                self.log(f"❌ Unexpected error: {e}")
                self.retry_count += 1
                time.sleep(10)
        
        self.log(f"❌ Build did not complete after {self.max_retries} resume attempts")
        return False

if __name__ == "__main__":
    agent = ForceResumeBuildAgent()
    success = agent.run_force_resume_until_done()
    exit(0 if success else 1)
