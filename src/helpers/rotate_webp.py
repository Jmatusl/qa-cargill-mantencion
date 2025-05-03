import os
from PIL import Image

# Definir la ruta de la carpeta donde se guardarán los iconos rotados
rotated_icons_folder = 'public/rotated_icons/'

# Asegurarse de que la carpeta de destino existe
if not os.path.exists(rotated_icons_folder):
    os.makedirs(rotated_icons_folder)

# Eliminar archivos antiguos en la carpeta de destino
for filename in os.listdir(rotated_icons_folder):
    if filename.startswith('rotated_icon_') and filename.endswith('.webp'):  # Asegúrate de buscar .webp
        os.remove(os.path.join(rotated_icons_folder, filename))

# Cambiar la extensión del archivo a .webp si vas a cargar un archivo WEBP
original_icon = Image.open('src/helpers/barco2.1.webp').convert("RGBA")  # Asegúrate de que el archivo sea WEBP

# Guardar la imagen original como el icono 0 y 360 en formato WEBP
original_icon.save(f'{rotated_icons_folder}rotated_icon_0.webp', 'WEBP')
original_icon.save(f'{rotated_icons_folder}rotated_icon_360.webp', 'WEBP')

# Rotar y guardar iconos cada 5 grados, excepto 0 y 360 que ya están guardados, en formato WEBP
for i in range(5, 360, 5):
    # Rotar la imagen sin expandir
    rotated_icon = original_icon.rotate(-i, expand=False)
    # Guardar la imagen rotada en formato WEBP
    rotated_icon.save(f'{rotated_icons_folder}rotated_icon_{i}.webp', 'WEBP')
