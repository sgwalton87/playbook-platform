from pathlib import Path
from PIL import Image, ImageOps
import colorsys

SRC = Path("public/demo/founder-archive")
OUT = SRC / "transparent"
OUT.mkdir(parents=True, exist_ok=True)

def is_green_or_background(r, g, b):
    # catches green couch/blanket and darker green-gray background
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    hue = h * 360

    greenish = 55 <= hue <= 175 and s > 0.12 and v > 0.18
    dull_green_gray = 65 <= hue <= 165 and s > 0.08 and v > 0.12 and g > r * 0.95 and g > b * 0.85

    return greenish or dull_green_gray

for path in sorted(SRC.glob("founder-archive-*.jpeg")):
    img = ImageOps.exif_transpose(Image.open(path)).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_green_or_background(r, g, b):
                pixels[x, y] = (r, g, b, 0)

    out = OUT / f"{path.stem}.png"
    img.save(out)
    print(f"transparent: {out}")

print("Done.")
