from pathlib import Path
from PIL import Image, ImageOps

SRC = Path("public/demo/founder-archive")
OUT = SRC / "special"
OUT.mkdir(parents=True, exist_ok=True)

SPECIAL = [3, 9, 10, 26, 34, 35]

for n in SPECIAL:
    src = SRC / f"founder-archive-{n:02d}.jpeg"
    if not src.exists():
        print(f"Missing {src}")
        continue

    img = Image.open(src)
    img = ImageOps.exif_transpose(img).convert("RGBA")

    # Keep the composition intact, but crop excess border slightly.
    w, h = img.size
    crop = (
        int(w * 0.03),
        int(h * 0.03),
        int(w * 0.97),
        int(h * 0.97),
    )
    img = img.crop(crop)

    out = OUT / f"founder-archive-{n:02d}.png"
    img.save(out)
    print(f"Prepared {out}")

print("Done.")
