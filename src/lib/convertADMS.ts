type CoordenadasGMS = {
  latitud: string;
  longitud: string;
};

export function convertirADMS(latitud: number, longitud: number): CoordenadasGMS {
  // Convertir la latitud
  const direccionLatitud = latitud >= 0 ? "N" : "S";
  latitud = Math.abs(latitud);
  const gradosLatitud = Math.floor(latitud);
  const minutosLatitud = Math.floor((latitud - gradosLatitud) * 60);
  const segundosLatitud = (
    (latitud - gradosLatitud - minutosLatitud / 60) *
    3600
  ).toFixed(2);

  // Convertir la longitud
  const direccionLongitud = longitud >= 0 ? "E" : "W";
  longitud = Math.abs(longitud);
  const gradosLongitud = Math.floor(longitud);
  const minutosLongitud = Math.floor((longitud - gradosLongitud) * 60);
  const segundosLongitud = (
    (longitud - gradosLongitud - minutosLongitud / 60) *
    3600
  ).toFixed(2);

  // Formatear las cadenas de salida
  const latitudGMS = `${gradosLatitud}°${minutosLatitud}'${segundosLatitud}" ${direccionLatitud}`;
  const longitudGMS = `${gradosLongitud}°${minutosLongitud}'${segundosLongitud}" ${direccionLongitud}`;

  return { latitud: latitudGMS, longitud: longitudGMS };
}
