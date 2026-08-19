from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/primedeal-feature-image.jpg")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/primedeal-feature-image-playstore-1024x500.jpg")
TARGET_WIDTH = 1024
TARGET_HEIGHT = 500


def center_crop_to_ratio(image: Image.Image, width: int, height: int) -> Image.Image:
    target_ratio = width / height
    source_width, source_height = image.size
    source_ratio = source_width / source_height

    if source_ratio > target_ratio:
        crop_width = round(source_height * target_ratio)
        left = (source_width - crop_width) // 2
        box = (left, 0, left + crop_width, source_height)
    else:
        crop_height = round(source_width / target_ratio)
        top = (source_height - crop_height) // 2
        box = (0, top, source_width, top + crop_height)

    return image.crop(box)


def main() -> None:
    with Image.open(SOURCE) as source_image:
        image = source_image.convert("RGB")
        cropped = center_crop_to_ratio(image, TARGET_WIDTH, TARGET_HEIGHT)
        rendered = cropped.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
        rendered.save(OUTPUT, "JPEG", quality=94, optimize=True, progressive=True)

    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
