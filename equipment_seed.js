const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const equipmentData = [
    // Mantención - Motores Eléctricos (10 equipos)
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Prelubricadora motor principal", brand: "AEG", model: "AM 160 MR4", series: "1084563", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Enfriamiento 1 motor principal", brand: "Weg", model: "TE0IF0X0X000010277", series: "1002951", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Enfriamiento motor generador babor", brand: "Weg", model: "1LTEIFAIXX003020", series: "HO87278", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Achique cloacas estribor", brand: "Weg", model: "1000013", series: "1000161116", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Separador aguas oleosas", brand: "Nord", model: "SK 80 S/4", series: "NM 2470734057400", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Thruster proa", brand: "Abb Motors", model: "M3BP 355 SMB4", series: "M61090384", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "UV babor", brand: "Siemens", model: "1LG4 253 4AA60", series: "UC 1106/080893001", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "Principal bodega estribor", brand: "Lonne", model: "14BG-313-8AB66-Z", series: "UC 0707/025016702", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "UV central", brand: "Siemens", model: "1LG4 253 4AA60", series: "UC 1107/088445202", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores Eléctricos", name: "UV estribor", brand: "Siemens", model: "1LG4 253 4AA60", series: "UC 1105/086511803", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },

    // Mantención - Motores a combustión (10 equipos)
    { area: "Mantención", subarea: "Motores a combustión", name: "Motor principal", brand: "Deutz", model: "SBV 9M 628", series: "628.09.010031", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Motor generador 2 popa", brand: "Deutz", model: "BF8M 1015 CP", series: "916683", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Generador de puerto", brand: "Weichai", model: "WP4.1D100E200", series: "BG07129252", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Auxiliar estribor Sala máquinas", brand: "Deutz", model: "BF8M 1015CP", series: "9188526", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Auxiliar babor Sala máquinas", brand: "Deutz", model: "BF8M 1015CP", series: "9166840", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Motor generador estribor", brand: "Weichai", model: "WPG110L1", series: "2107149341F", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Motor generador babor", brand: "MWM", model: "TBD 234 V 12", series: "234.12.01583", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Generador auxiliar", brand: "Deutz", model: "BF8M 1015C", series: "6640219", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Motor principal auxiliar", brand: "Volvo Penta", model: "TAD 121CHC", series: "1101007019", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Motores a combustión", name: "Motor generador auxiliar", brand: "Deutz", model: "BF8M 1015MC", series: "234.12.01583", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },

    // Mantención - Bombas Agua (10 equipos)
    { area: "Mantención", subarea: "Bombas Agua", name: "Enfriamiento 1 motor principal", brand: "Vogt", model: "AM901CMS", series: "13 025185 10155", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "UV babor", brand: "Sterling Halber", model: "NOWA 200250", series: "07_2027", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Principal bodega estribor", brand: "Ing. Per Gjerdrum", model: "P 500/500 VA4", series: "305581", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Achique cloacas estribor", brand: "Vogt", model: "AM701CMS", series: "13 005769 04088", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Achique cloacas babor", brand: "Vogt", model: "AM701CMS", series: "13 005771 04085", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "UV central", brand: "Sterling Halber", model: "NOWA 200250", series: "08_0112", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "UV estribor", brand: "Sterling Halber", model: "NOWA 200250", series: "08_0111", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Principal bodega central", brand: "Ing. Per Gjerdrum", model: "P 500/500 VA4", series: "S/S", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Principal bodega babor", brand: "Ing. Per Gjerdrum", model: "P 500/500 VA4", series: "S/S", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Enfriamiento motor generador estribor", brand: "Vogt", model: "HM615MMS", series: "16 005345 03082", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Bombas Agua", name: "Enfriamiento motor generador babor", brand: "Vogt", model: "HM615MMS", series: "16 005688 04085", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },

    // Mantención - Generadores (completa los 10 equipos)
    { area: "Mantención", subarea: "Generadores", name: "Generador 2 babor", brand: "Mecc Alte", model: "ECO40-3S/4", series: "1247756", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador puerto Popa", brand: "Leroy-sommer", model: "TAL-A44-DJ6S4", series: "755062001", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador cola", brand: "Weg", model: "GPA 500", series: "168214 0807", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador 3 popa", brand: "Siemens", model: "DD 500 011 WT", series: "872473", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador estribor", brand: "Marelli", model: "MJBM355 MA4 B2", series: "MJB3532LT14MO", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador babor", brand: "Mecc Alte", model: "ECO40-3S/4", series: "1469455", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador popa", brand: "Stamford", model: "HC444E2", series: "C631119/03", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador central", brand: "FURUNO", model: "GP-32", series: "N/A", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador auxiliar", brand: "Siemens", model: "DD 500 011 WT", series: "872473", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
    { area: "Mantención", subarea: "Generadores", name: "Generador puerto auxiliar", brand: "Leroy-sommer", model: "TAL-A44-DJ6S4", series: "755062001", shipId: Math.floor(Math.random() * 3) + 1, responsibleId: Math.floor(Math.random() * 6) + 1 },
  ];

  for (const equipment of equipmentData) {
    await prisma.equipment.create({
      data: {
        ...equipment,
      },
    });
    console.log(`Equipo ${equipment.name} añadido.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
