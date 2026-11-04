"""Regenerate the derived images from the sources.

    python -I tools/images.py

photos/*.jpg            -> photos/thumbs/<name>.webp   480x360, centre-cropped to 4:3 (menu cards)
img/doughy/<name>.png   -> photos/<name>-sm.webp        360 px on the long edge (menu hero, home guide, "coming soon" card)
img/doughy/doughy-menu.png -> favicon.png (64x64) and apple-touch-icon.png (180x180 on cream)

Needs Pillow:  pip install pillow
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is missing: pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "photos")
THUMBS = os.path.join(PHOTOS, "thumbs")
DOUGHY = os.path.join(ROOT, "img", "doughy")
CREAM = (255, 249, 243, 255)


def thumb(src, dst, w=480, h=360, quality=78):
    im = Image.open(src).convert("RGB")
    sw, sh = im.size
    if sw / sh <= w / h:
        tw, th = sw, int(sw * h / w)
    else:
        tw, th = int(sh * w / h), sh
    left, top = (sw - tw) // 2, (sh - th) // 2
    im = im.crop((left, top, left + tw, top + th)).resize((w, h), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)
    return im.size, os.path.getsize(dst)


def small(src, dst, long_edge=360, quality=82):
    im = Image.open(src).convert("RGBA")
    im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)
    return im.size, os.path.getsize(dst)


def icon(src, dst, size, background=None):
    im = Image.open(src).convert("RGBA")
    im.thumbnail((size, size), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    canvas.save(dst, "PNG", optimize=True)
    return canvas.size, os.path.getsize(dst)


def main():
    os.makedirs(THUMBS, exist_ok=True)
    for name in sorted(os.listdir(PHOTOS)):
        if name.lower().endswith(".jpg"):
            out = os.path.join(THUMBS, name[:-4] + ".webp")
            print("thumb ", os.path.relpath(out, ROOT), *thumb(os.path.join(PHOTOS, name), out))
    for name in sorted(os.listdir(DOUGHY)):
        if name.lower().endswith(".png"):
            out = os.path.join(PHOTOS, name[:-4] + "-sm.webp")
            print("small ", os.path.relpath(out, ROOT), *small(os.path.join(DOUGHY, name), out))
    face = os.path.join(DOUGHY, "doughy-menu.png")
    print("icon  favicon.png", *icon(face, os.path.join(ROOT, "favicon.png"), 64))
    print("icon  apple-touch-icon.png", *icon(face, os.path.join(ROOT, "apple-touch-icon.png"), 180, CREAM))


if __name__ == "__main__":
    main()
