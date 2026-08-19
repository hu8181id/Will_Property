from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/upload/ade366b0-9ba0-11f1-8711-b307e68ae532.png")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/primedeal-apkpure-icon-512.png")


def main() -> None:
    with Image.open(SOURCE) as image:
        rendered = image.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
        rendered.save(OUTPUT, "PNG", optimize=True)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
