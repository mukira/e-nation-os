import shutil
import os
import subprocess
import sys

print(f"PATH: {os.environ['PATH']}")
gn_path = shutil.which("gn")
print(f"gn path: {gn_path}")

if gn_path:
    try:
        subprocess.run([gn_path, "--version"], check=True)
        print("gn execution successful (absolute path)")
    except Exception as e:
        print(f"gn execution failed (absolute path): {e}")

    try:
        subprocess.run(["gn", "--version"], check=True)
        print("gn execution successful (command name)")
    except Exception as e:
        print(f"gn execution failed (command name): {e}")
else:
    print("gn not found in PATH")
