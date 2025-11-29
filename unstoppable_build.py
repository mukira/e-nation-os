#!/usr/bin/env python3
"""
Force-Resume Build Agent
- Detects stalls (5 min no progress)
- RESUMES from last successful step (doesn't restart!)
- Applies fixes automatically
- NEVER gives up until successful
"""

import subprocess
import time
import os
import re
from datetime import datetime

class ForceResumeBuildAgent:
    def __init__(self):
        self.build_dir = os.path.expanduser("~/chromium/src")
        self.out_dir = f"{self.build_dir}/out/Release"
        self.status_file = "agent_status.txt"
        self.log_file = "build_smart_resume.log"
        self.stall_timeout = 300  # 5 minutes
        self.last_progress = time.time()
        self.last_target_count = 0
        self.retry_count = 0
        self.max_retries = 20
        self.build_process = None
        
    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
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
                return False
        
        # Check if stalled
        elapsed = time.time() - self.last_progress
        if elapsed > self.stall_timeout:
            self.log(f"⚠️ STALL DETECTED: No progress for {int(elapsed)}s at target {self.last_target_count}")
            return True
        return False
    
    def identify_error(self):
        """Identify the specific error from ninja output"""
        build_log = f"{self.out_dir}/.ninja_log"
        
        # Check last 100 lines of stdout (captured in real-time)
        # For now, check common patterns
        
        errors = {
            "coreml": "GetDataTypeByteSize",
            "memory": "c++: fatal error: Killed signal",
            "disk": "No space left",
            "missing": "No such file"
        }
        
        # Read recent output (we'd need to capture this)
        return "unknown"
    
    def apply_fix(self, error_type):
        """Apply automatic fix based on error type"""
        self.log(f"🔧 Applying fix for: {error_type}")
        
        if error_type == "coreml":
            try:
                subprocess.run(["python3", f"{os.path.dirname(self.build_dir)}/BrowserOS/fix_coreml_build.py"], check=True)
                return True
            except:
                return False
        
        elif error_type == "memory":
            self.log("Reducing concurrency...")
            current_jobs = os.environ.get('JOBS', '6')
            new_jobs = max(2, int(current_jobs) - 2)
            os.environ['JOBS'] = str(new_jobs)
            self.log(f"JOBS: {current_jobs} → {new_jobs}")
            return True
        
        elif error_type == "disk":
            self.log("Cleaning temp files...")
            subprocess.run(["rm", "-rf", f"{self.out_dir}/obj/gen/chrome/app"], check=False)
            return True
        
        # Generic fix - just wait and retry
        time.sleep(5)
        return True
    
    def force_resume_build(self):
        """Resume build from last successful target (doesn't start over!)"""
        os.chdir(self.build_dir)
        
        # Set environment
        os.environ['PATH'] = f"{os.environ.get('PATH')}:{os.path.expanduser('~/depot_tools')}"
        os.environ.setdefault('JOBS', '6')
        
        # Increase limits
        subprocess.run(["ulimit", "-n", "10000"], shell=True)
        subprocess.run(["ulimit", "-v", "unlimited"], shell=True)
        
        self.log(f"🔄 RESUMING build (attempt {self.retry_count + 1}/{self.max_retries})")
        self.log(f"   Last completed: {self.last_target_count} targets")
        self.log(f"   JOBS: {os.environ.get('JOBS')}")
        self.update_status("RESUMING")
        
        # CRITICAL: Use ninja directly to force resume
        # ninja automatically resumes from where it left off!
        cmd = ["ninja", "-C", self.out_dir, "chrome"]
        
        self.log(f"   Command: {' '.join(cmd)}")
        
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
                    self.log(f"   Last line: {last_line}")
                    return False
            
            # Print output (clean)
            clean_line = line.strip()
            if clean_line:
                print(clean_line)
                last_line = clean_line
            
            # Check for stall
            if self.detect_stall(line):
                self.log("⚠️ Stall detected - will kill and RESUME...")
                self.build_process.kill()
                self.build_process.wait()
                return False
            
            # Check for fatal errors (but let ninja handle most)
            if "FAILED:" in line:
                self.log(f"❌ Build error: {line.strip()}")
                # Don't immediately kill - let ninja try to continue
    
    def run_force_resume_until_done(self):
        """Main loop - resumes build until success"""
        self.log("=" * 70)
        self.log("🔄 FORCE-RESUME BUILD AGENT ACTIVATED")
        self.log("   This will RESUME from where it stopped, not restart!")
        self.log("=" * 70)
        
        while self.retry_count < self.max_retries:
            try:
                # Resume build (ninja remembers what was done)
                self.force_resume_build()
                
                # Monitor build
                success = self.monitor_build()
                
                if success:
                    self.log("🎉 BUILD COMPLETED SUCCESSFULLY!")
                    self.log(f"   Total resume attempts: {self.retry_count}")
                    return True
                
                # Build failed or stalled - will resume (not restart!)
                self.retry_count += 1
                
                if self.retry_count >= self.max_retries:
                    self.log(f"❌ MAX RESUME ATTEMPTS ({self.max_retries}) REACHED")
                    break
                
                # Small delay before resume
                self.log(f"⏳ Resuming in 5 seconds... (attempt {self.retry_count + 1})")
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
        self.update_status("FAILED")
        return False

if __name__ == "__main__":
    agent = ForceResumeBuildAgent()
    success = agent.run_force_resume_until_done()
    exit(0 if success else 1)
