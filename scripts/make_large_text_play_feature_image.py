from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/primedeal-feature-image-large-text.png")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/primedeal-feature-image-large-text-playstore-1024x500.jpg")
TARGET_WIDTH = 1024
TARGET_HEIGHT = 500
EDGE_TRIM = 64
BACKGROUND = (3, 25, 66)


def main() -> None:
    with Image.open(SOURCE) as source_image:
        image = source_image.convert("RGB")
        width, height = image.size
        clean = image.crop((EDGE_TRIM, EDGE_TRIM, width - EDGE_TRIM, height - EDGE_TRIM))

        scaled_height = round(clean.height * TARGET_WIDTH / clean.width)
        scaled = clean.resize((TARGET_WIDTH, scaled_height), Image.Resampling.LANCZOS)

        canvas = Image.new("RGB", (TARGET_WIDTH, TARGET_HEIGHT), BACKGROUND)
        top = (TARGET_HEIGHT - scaled_height) // 2
        canvas.paste(scaled, (0, top))
        canvas.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)

    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
