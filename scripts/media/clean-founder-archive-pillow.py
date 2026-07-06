from pathlib import Path
from PIL import Image, ImageChops, ImageOps

SOURCE = Path("public/demo/founder-archive")
OUTPUT = SOURCE / "clean"
OUTPUT.mkdir(parents=True, exist_ok=True)

ROTATE = {
    7: 90,
    11: 90,
    17: 90,
}

def number_from_name(path):
    return int(path.stem.split("-")[-1])

def trim_background(img):
    img = ImageOps.exif_transpose(img).convert("RGBA")

    # sample likely couch/blanket background from image corners
    w, h = img.size
    samples = [
        img.getpixel((5, 5)),
        img.getpixel((w - 6, 5)),
        img.getpixel((5, h - 6)),
        img.getpixel((w - 6, h - 6)),
    ]

    # use average corner color as background
    bg = tuple(sum(px[i] for px in samples) // len(samples) for i in range(4))
    background = Image.new("RGBA", img.size, bg)

    diff = ImageChops.difference(img, background).convert("L")

    # strengthen mask
    mask = diff.point(lambda p: 255 if p > 22 else 0)

    bbox = mask.getbbox()
    if bbox:
        pad = 12
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(w, bbox[2] + pad)
        bottom = min(h, bbox[3] + pad)
        img = img.crop((left, top, right, bottom))

    return img

files = sorted(SOURCE.glob("founder-archive-*.jpeg"))

for path in files:
    number = number_from_name(path)
    img = Image.open(path)

    cleaned = trim_background(img)

    if number in ROTATE:
        cleaned = cleaned.rotate(ROTATE[number], expand=True)

    out = OUTPUT / f"founder-archive-{number:02d}.png"
    cleaned.save(out)
    print(f"cleaned {out}")

print(f"Done: {OUTPUT}")
