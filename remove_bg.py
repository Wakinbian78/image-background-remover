#!/usr/bin/env python3
"""
image-background-remover
Remove backgrounds from images using rembg.
"""

import argparse
import os
from pathlib import Path
from rembg import remove
from PIL import Image


def remove_background(input_path: str, output_path: str) -> None:
    """Remove background from a single image."""
    with open(input_path, "rb") as f:
        input_data = f.read()
    output_data = remove(input_data)
    with open(output_path, "wb") as f:
        f.write(output_data)
    print(f"Done: {input_path} -> {output_path}")


def process_folder(input_folder: str, output_folder: str) -> None:
    """Remove backgrounds from all images in a folder."""
    input_dir = Path(input_folder)
    output_dir = Path(output_folder)
    output_dir.mkdir(parents=True, exist_ok=True)

    supported = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    images = [f for f in input_dir.iterdir() if f.suffix.lower() in supported]

    if not images:
        print("No supported images found in folder.")
        return

    for img_path in images:
        out_path = output_dir / (img_path.stem + ".png")
        remove_background(str(img_path), str(out_path))

    print(f"\nProcessed {len(images)} image(s).")


def main():
    parser = argparse.ArgumentParser(description="Remove image backgrounds")
    parser.add_argument("input", help="Input image file or source folder (with --folder)")
    parser.add_argument("output", help="Output image file or destination folder (with --folder)")
    parser.add_argument("--folder", action="store_true", help="Process all images in a folder")
    args = parser.parse_args()

    if args.folder:
        process_folder(args.input, args.output)
    else:
        remove_background(args.input, args.output)


if __name__ == "__main__":
    main()
