from PIL import Image
import os

# Definir el directorio donde se encuentran los iconos
icons_directory = 'public/rotated_icons/'

# Definir el color azul que deseas utilizar
blue_color = (0, 0, 255, 255)  # RGBA para azul

# Listar todos los archivos png en el directorio
for filename in os.listdir(icons_directory):
    if filename.endswith('.png'):
        file_path = os.path.join(icons_directory, filename)

        # Cargar la imagen
        image = Image.open(file_path).convert("RGBA")
        datas = image.getdata()

        # Cambiar el color de todos los píxeles que no son transparentes a azul
        new_data = [(blue_color if pixel[3] != 0 else (255, 255, 255, 0)) for pixel in datas]

        # Guardar los cambios en la imagen
        image.putdata(new_data)
        image.save(file_path)

print("Conversion to blue completed for all PNG images.")
