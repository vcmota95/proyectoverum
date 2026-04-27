import React from 'react';

export const FLAGS = [
  { code: 'ar', name: 'Argentina' },
  { code: 'bo', name: 'Bolivia' },
  { code: 'br', name: 'Brasil' },
  { code: 'cl', name: 'Chile' },
  { code: 'co', name: 'Colombia' },
  { code: 'cr', name: 'Costa Rica' },
  { code: 'cu', name: 'Cuba' },
  { code: 'do', name: 'República Dominicana' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'sv', name: 'El Salvador' },
  { code: 'gt', name: 'Guatemala' },
  { code: 'hn', name: 'Honduras' },
  { code: 'mx', name: 'México' },
  { code: 'ni', name: 'Nicaragua' },
  { code: 'pa', name: 'Panamá' },
  { code: 'py', name: 'Paraguay' },
  { code: 'pe', name: 'Perú' },
  { code: 'uy', name: 'Uruguay' },
  { code: 've', name: 'Venezuela' },
  { code: 'us', name: 'Estados Unidos' },
  { code: 'es', name: 'España' },
  { code: 'it', name: 'Italia' },
  { code: 'fr', name: 'Francia' },
  { code: 'de', name: 'Alemania' },
  { code: 'gb', name: 'Reino Unido' },
  { code: 'ca', name: 'Canadá' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ru', name: 'Rusia' },
  { code: 'cn', name: 'China' },
  { code: 'jp', name: 'Japón' },
  { code: 'kr', name: 'Corea del Sur' },
  { code: 'in', name: 'India' },
  { code: 'za', name: 'Sudáfrica' },
  { code: 'au', name: 'Australia' },
  { code: 'nz', name: 'Nueva Zelanda' },
  { code: 'ch', name: 'Suiza' },
  { code: 'se', name: 'Suecia' },
  { code: 'no', name: 'Noruega' },
  { code: 'fi', name: 'Finlandia' },
  { code: 'dk', name: 'Dinamarca' },
  { code: 'nl', name: 'Países Bajos' },
  { code: 'be', name: 'Bélgica' },
  { code: 'ie', name: 'Irlanda' },
  { code: 'gr', name: 'Grecia' },
  { code: 'tr', name: 'Turquía' },
  { code: 'il', name: 'Israel' },
  { code: 'eg', name: 'Egipto' },
  { code: 'ma', name: 'Marruecos' },
  { code: 'dz', name: 'Argelia' }
];

export const renderFlag = (flagCode, size = 20) => {
  if (!flagCode || flagCode === '🇦🇷') flagCode = 'ar'; // fallback for existing mocked data
  if (flagCode.length > 2) return React.createElement('span', null, flagCode);
  return React.createElement('img', {
    src: `https://flagcdn.com/w40/${flagCode}.png`,
    alt: flagCode,
    width: size,
    style: { borderRadius: '2px', objectFit: 'cover', display: 'inline-block' }
  });
};
