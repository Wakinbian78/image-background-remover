# image-background-remover

A simple CLI tool to remove backgrounds from images using [rembg](https://github.com/danielgatis/rembg).

## Requirements

- Python 3.8+
- pip

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python remove_bg.py input.jpg output.png
```

Or process a whole folder:

```bash
python remove_bg.py --folder ./input_images ./output_images
```

## License

MIT
