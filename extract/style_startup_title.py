"""Recolor the handwritten startup title without changing its lettering."""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "新建文件夹" / "assets" / "startup" / "title-math-universe.png"
OUTPUT = ROOT / "extract" / "build" / "startup-assets" / "title-math-universe-color.png"
STOPS = [
    (0.00, (48, 126, 205)),
    (0.27, (34, 161, 139)),
    (0.52, (226, 102, 68)),
    (0.76, (239, 181, 54)),
    (1.00, (106, 82, 174)),
]


def mix(left: tuple[int, int, int], right: tuple[int, int, int], amount: float):
    return tuple(
        round(left[index] + (right[index] - left[index]) * amount)
        for index in range(3)
    )


def gradient_color(position: float):
    for index in range(len(STOPS) - 1):
        start, start_color = STOPS[index]
        end, end_color = STOPS[index + 1]
        if position <= end:
            amount = (position - start) / max(0.0001, end - start)
            return mix(start_color, end_color, amount)
    return STOPS[-1][1]


def main() -> None:
    with Image.open(SOURCE) as original:
        lettering = original.convert("RGBA")

    alpha = lettering.getchannel("A")
    colors = Image.new("RGBA", lettering.size)
    pixels = colors.load()
    width, height = lettering.size

    for x in range(width):
        position = x / max(1, width - 1)
        red, green, blue = gradient_color(position)
        for y in range(height):
            pixels[x, y] = (red, green, blue, 255)

    colors.putalpha(alpha)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    colors.save(OUTPUT, format="PNG", optimize=True)
    print(f"{OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
