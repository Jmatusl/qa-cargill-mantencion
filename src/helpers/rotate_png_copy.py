import os
from PIL import Image

# Definir la ruta de la carpeta donde se guardarán los iconos rotados
rotated_icons_folder = 'public/rotated_icons/'

# Asegurarse de que la carpeta de destino existe
if not os.path.exists(rotated_icons_folder):
    os.makedirs(rotated_icons_folder)

# Eliminar archivos antiguos en la carpeta de destino
for filename in os.listdir(rotated_icons_folder):
    if filename.startswith('rotated_icon_'):
        os.remove(os.path.join(rotated_icons_folder, filename))

# Cargar la imagen
original_icon = Image.open('src/helpers/barco2.1.png').convert("RGBA")

# Guardar la imagen original como el icono 0 y 360
original_icon.save(f'{rotated_icons_folder}rotated_icon_0.png')
original_icon.save(f'{rotated_icons_folder}rotated_icon_360.png')

# Rotar y guardar iconos cada 5 grados, excepto 0 y 360 que ya están guardados
for i in range(5, 360, 5):
    # Rotar la imagen sin expandir
    rotated_icon = original_icon.rotate(-i, expand=False)
    # Guardar la imagen rotada
    rotated_icon.save(f'{rotated_icons_folder}rotated_icon_{i}.png')
