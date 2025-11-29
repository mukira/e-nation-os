#!/usr/bin/env python3
import os
import time
import subprocess
import sys
import re
from pathlib import Path

# Configuration
BUILD_DIR = Path("/Users/Mukira/chromium/src/out/Default_x64")
METRICS_FILE = BUILD_DIR / "siso_metrics.json"
SISO_OUTPUT = BUILD_DIR / "siso_output"
PROJECT_ROOT = Path("/Users/Mukira/Downloads/BrowserOS")
STALL_TIMEOUT = 300  # seconds (5 minutes to allow gn gen to complete)

def get_file_mtime(path):
    try:
        return os.path.getmtime(path)
    except FileNotFoundError:
        return 0

def is_build_running():
    try:
        # Check for build.py or autoninja processes
        result = subprocess.run(["ps", "aux"], capture_output=True, text=True)
        return "build.py" in result.stdout or "autoninja" in result.stdout or "siso" in result.stdout
    except Exception:
        return False

def kill_build_processes():
    print("⚠️  Killing stalled/failed build processes...")
    subprocess.run("pkill -f 'build.py'", shell=True)
    subprocess.run("pkill -f 'autoninja'", shell=True)
    subprocess.run("pkill -f 'siso'", shell=True)
    time.sleep(2)

def analyze_and_fix_error():
    print("🔍 Analyzing failure...")
    
    # Read last part of siso_output
    if not SISO_OUTPUT.exists():
        print("   No siso_output found.")
        return False

    try:
        # Read last 500 lines
        with open(SISO_OUTPUT, 'r', errors='ignore') as f:
            lines = f.readlines()[-500:]
        log_content = "".join(lines)
    except Exception as e:
        print(f"   Error reading log: {e}")
        return False

    fixed = False

    # FIX 1: utils_coreml.mm missing enum case
    if "utils_coreml.mm" in log_content and "MLMultiArrayDataTypeInt8" in log_content:
        print("   Found utils_coreml.mm error. Applying fix...")
        file_path = Path("/Users/Mukira/chromium/src/services/webnn/coreml/utils_coreml.mm")
        if file_path.exists():
            with open(file_path, 'r') as f:
                content = f.read()
            
            if 'case MLMultiArrayDataTypeInt8:' not in content:
                content = content.replace(
                    'case MLMultiArrayDataTypeFloat16:\n      return 2;',
                    'case MLMultiArrayDataTypeFloat16:\n      return 2;\n    case MLMultiArrayDataTypeInt8:\n      return 1;'
                )
                # Also fix return at end if needed
                if 'return 0;\n}' not in content and '}\n}' in content:
                     content = content.replace('  }\n}', '  }\n  return 0;\n}')
                
                with open(file_path, 'w') as f:
                    f.write(content)
                print("   ✅ Applied utils_coreml.mm fix.")
                fixed = True

    # Add more fixes here as needed...

    return fixed

def resume_build(retry_count):
    # Dynamic concurrency based on retries
    # Start with 10, reduce by 2 for each retry to prevent OOM
    base_jobs = 10
    current_jobs = max(2, base_jobs - (retry_count * 2))
    
    print(f"🚀 Resuming build (Intel x64 Release) with -j {current_jobs}...")
    
    # Use run_build.sh with concurrency flag
    cmd = ["./run_build.sh", "-j", str(current_jobs)]
    
    with open("build_smart_resume.log", "a") as log_file:
        process = subprocess.Popen(
            cmd,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd=PROJECT_ROOT,
            preexec_fn=os.setsid
        )

def main():
    print("🤖 Smart Build Agent Active")
    print(f"   Monitoring: {METRICS_FILE}")
    print(f"   Timeout: {STALL_TIMEOUT}s")
    
    retry_count = 0
    MAX_RETRIES = 10
    
    STATUS_FILE = PROJECT_ROOT / "agent_status.txt"

    def update_status(status_text):
        with open(STATUS_FILE, "w") as f:
            f.write(status_text)

    update_status("MONITORING")

    while True:
        last_mtime = get_file_mtime(METRICS_FILE)
        current_time = time.time()
        time_since_update = current_time - last_mtime
        
        running = is_build_running()
        
        status = "RUNNING" if running else "STOPPED"
        print(f"\r[{status}] Last update: {int(time_since_update)}s ago | Retries: {retry_count}/{MAX_RETRIES}", end="", flush=True)

        if running:
            update_status("BUILDING")
            # Reset retry count if we are making progress (running for > 5 mins without stall)
            # This is a simple heuristic
            pass

            if time_since_update > STALL_TIMEOUT:
                print("\n\n🚨 DETECTED STALL (No progress for 300s)")
                # update_status("STALLED")
                # kill_build_processes() # DISABLED for bulletproof mode
                print("   Ignoring stall in bulletproof mode. Waiting...")
                
                # Try to fix
                update_status("ANALYZING_FAILURE")
                if analyze_and_fix_error():
                    print("   Fix applied. Restarting...")
                    update_status("FIXING_APPLIED")
                    retry_count = 0 # Reset on successful fix
                else:
                    print("   No specific fix found. Restarting to retry (could be flake)...")
                    update_status("RETRYING")
                    retry_count += 1
                
                if retry_count > MAX_RETRIES:
                    print("\n❌ Too many retries without progress. Stopping agent.")
                    update_status("FAILED_MAX_RETRIES")
                    break

                resume_build()
                update_status("RESUMING")
                # Reset wait time
                time.sleep(10)
        else:
            # Build process is not running
            
            # Check if we finished successfully recently
            if os.path.exists("build_smart_resume.log"):
                with open("build_smart_resume.log", "r", errors="ignore") as f:
                    last_lines = f.read()[-1000:]
                if "Build complete" in last_lines or "STAMP obj/chrome/chrome.stamp" in last_lines:
                    print("\n\n✅ BUILD FINISHED SUCCESSFULLY! Agent exiting.")
                    update_status("COMPLETED")
                    break

            # If stopped and not finished (heuristic: check if we just started or if it crashed)
            if time_since_update > 10: # Give it 10s grace after stop
                 print("\n\n🚨 DETECTED CRASH/STOP (Process exited unexpectedly)")
                 update_status("CRASHED")
                 if analyze_and_fix_error():
                     print("   Fix applied. Restarting...")
                     update_status("FIXING_CRASH")
                 else:
                     print("   No specific fix found. Restarting...")
                     update_status("RESTARTING_CRASH")
                 resume_build()
                 time.sleep(10)

        time.sleep(5)

if __name__ == "__main__":
    main()
