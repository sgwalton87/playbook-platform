#!/usr/bin/env python3

from pathlib import Path
import shutil
from datetime import datetime

FILE = Path("app/u/[username]/page.tsx")

if not FILE.exists():
    raise SystemExit(f"❌ Can't find {FILE}")

backup_dir = Path("scripts/backups")
backup_dir.mkdir(parents=True, exist_ok=True)

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = backup_dir / f"{stamp}_{FILE.name}"

shutil.copy2(FILE, backup)

print(f"✅ Backup created: {backup}")
print("🟢 Patch framework is working.")
print("🚀 Ready for Profile Engine changes.")
