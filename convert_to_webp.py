import os
import sys
from PIL import Image

def convert_images_to_webp(input_dir):
    if not os.path.isdir(input_dir):
        print(f"Error: '{input_dir}' no es un directorio válido.")
        return

    parent_dir = os.path.dirname(os.path.abspath(input_dir))
    output_dir = os.path.join(parent_dir, "webp_output")
    os.makedirs(output_dir, exist_ok=True)

    valid_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".gif")

    for filename in os.listdir(input_dir):
        if filename.lower().endswith(valid_extensions):
            input_path = os.path.join(input_dir, filename)
            try:
                with Image.open(input_path) as img:
                    name, _ = os.path.splitext(filename)
                    output_path = os.path.join(output_dir, f"{name}.webp")
                    img.save(output_path, "webp")
                    print(f"Convertido: {filename} → {name}.webp")
            except Exception as e:
                print(f"Error al convertir {filename}: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python convert_to_webp.py <directorio_de_entrada>")
    else:
        convert_images_to_webp(sys.argv[1])
