import os
from PIL import Image

# Definir la ruta de la carpeta donde se guardarán los iconos rotados
rotated_icons_folder = 'public/rotated_icons/'

# Eliminar archivos antiguos en la carpeta de destino
for filename in os.listdir(rotated_icons_folder):
    if filename.startswith('rotated_icon_'):
        os.remove(os.path.join(rotated_icons_folder, filename))

# Cargar la imagen
original_icon = Image.open('src/helpers/damisela_numero_2.png').convert("RGBA")

blue_color = (0, 0, 255, 255) # RGBA para azul

#TODO: añadir que icono 0 sea el original al igual  que el 360

# Rotar y guardar iconos cada 5 grados
for i in range(0, 360, 5):
    
    
    # Rotar la imagen
    rotated_icon = original_icon.rotate(-i, expand=True)

    # Convertir píxeles blancos a transparentes
    datas = rotated_icon.getdata()
    new_data = []
    for item in datas:
        # Cambiar todos los píxeles blancos (o casi blancos) a transparentes
        if item[0] > 200 and item[1] > 200 and item[2] > 200:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    rotated_icon.putdata(datas)

    # Guardar la imagen rotada
    rotated_icon.save(f'{rotated_icons_folder}rotated_icon_{i}.png')


