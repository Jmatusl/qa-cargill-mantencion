import JSZip from 'jszip';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define la ruta al archivo KMZ y la ubicación de destino para el KML
const kmzFilePath = path.join(__dirname,  'Barrios.kmz');
const publicDirPath = path.join(__dirname, '../../', 'public');
const kmlDestPath = path.join(publicDirPath, 'Barrios.kml');

async function extractKMLFromKMZ() {
  try {
    const data = await readFile(kmzFilePath);
    const zip = await JSZip.loadAsync(data);
    
    const kmlFilename = Object.keys(zip.files).find(filename => filename.endsWith('.kml'));
    if (!kmlFilename) {
      throw new Error('Archivo KML no encontrado dentro del KMZ');
    }

    const kmlContent = await zip.files[kmlFilename].async('nodebuffer');
    await writeFile(kmlDestPath, kmlContent);
    console.log(`Archivo KML guardado en: ${kmlDestPath}`);
  } catch (err) {
    console.error('Error al extraer el KML del KMZ:', err);
  }
}

extractKMLFromKMZ();
