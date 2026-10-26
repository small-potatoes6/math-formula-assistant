"""Create high-quality WebP copies of topic figures for the mini program."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "extract" / "topic-source" / "figures"
OUTPUT_DIR = ROOT / "extract" / "topic-source" / "figures-webp"
QUALITY = 90
METHOD = 6


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    source_files = sorted(SOURCE_DIR.glob("*.png"))
    source_bytes = 0
    output_bytes = 0

    for source_file in source_files:
        output_file = OUTPUT_DIR / f"{source_file.stem}.webp"
        source_bytes += source_file.stat().st_size
        if output_file.exists() and output_file.stat().st_mtime >= source_file.stat().st_mtime:
            output_bytes += output_file.stat().st_size
            continue

        with Image.open(source_file) as image:
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            image.save(
                output_file,
                "WEBP",
                quality=QUALITY,
                method=METHOD,
                alpha_quality=100,
            )
        output_bytes += output_file.stat().st_size

    print(
        f"Prepared {len(source_files)} WebP figures: "
        f"{source_bytes} B -> {output_bytes} B"
    )


if __name__ == "__main__":
    main()
