# Notas de diseño — fidelidad a Figma

Fuente: archivo Figma **“Mejora diseño Legión Anime Full (Copy)”** (key `y1TXgZ2S4CY6hA1q1q8Zlu`). Los 9 frames fueron leídos vía Figma REST API (árbol de nodos con colores/tipografías exactos) y exportados como PNG de referencia en `design/reference/`.

## Tokens extraídos (exactos)

### Colores
| Token | Hex | Uso en Figma |
|---|---|---|
| background | `#131313` | Fondo de todas las pantallas |
| playerBackground | `#121212` | Pantalla de reproducción |
| surface | `#1B1B1B` | Bloques de raíles (Recomendados, En Emisión, Géneros, Tipo, grids) |
| elevated | `#262626` | Barra de navegación, filas de episodios, tab-strip de Listas, filas de menú |
| titleBar | `#000000` | Barra de título bajo las cards del hero |
| textPrimary | `#FFFFFF` | Títulos JetBrains Mono / Calistoga |
| textSecondary | `#EDEDED` | Texto de filas de episodios |
| textMuted | `#A9A9A9` | Labels de navegación |
| iconMuted | `#BABABA` | Iconos de navegación |

### Tipografía
| Rol | Fuente | Tamaño/peso |
|---|---|---|
| Títulos de sección (Inicio, Directorio, Perfil…) | **JetBrains Mono** | 20 px / 400 |
| Subtítulos de grupo (Hoy, Ayer, En Emisión, Géneros, Tipo) | **JetBrains Mono** | 15 px / 400 |
| Título de card hero | **JetBrains Mono** | 14 px / 400 |
| Datos de perfil / menú | **JetBrains Mono** | 16 px / 400 |
| Títulos de cards y pósters | **Calistoga** | 12 px / 400 |
| Título de fila de episodio | **Circular Spotify Text** | 12 px / 900 |
| Label de episodio / navegación | **Circular Spotify Text** | 12 px / 400 |

**Sustitución documentada**: *Circular Spotify Text* es una fuente propietaria de Spotify y no es distribuible. Se sustituyó por **Poppins** (Google Fonts, geométrica y de proporciones cercanas), cargada con `@expo-google-fonts/poppins`. JetBrains Mono y Calistoga son Google Fonts y se usan tal cual. La barra de estado “11:25 Inter” del mock se reemplaza por el status bar nativo del dispositivo.

### Medidas clave (421 px de ancho de referencia)
- Padding lateral de pantalla: **15 px**; títulos de sección: **18 px** horizontales / 7 px verticales.
- Header: avatar circular **66 px**, icono de búsqueda 26 px, altura **80 px**, padding horizontal 25 px.
- Hero cards: **430×300** con barra de título negra de **35 px**.
- Pósters de raíl: **134×207** + título Calistoga debajo.
- Grid 2 columnas: **163×261** (imagen 161×238), wrap con gap 32 (se normaliza a 14 px).
- Filas de episodios: fondo `#262626`, radio **3 px**, padding 8/16, thumbnail **121×121**.
- Tab-strip de Listas: fondo `#262626`, labels JetBrains Mono 20, tabs: Favoritos · Siguiendo · Ver Luego · Terminados · Últimos 30 Vistos · Descartados.
- Nav inferior: 4 ítems (Inicio, Listas, Directorio, Perfil), iconos ~26 px + label 12 px, alto ~82 px.
- Reproducción: fondo `#121212`, video 16:9 centrado.

## Mapeo frame → ruta

| Frame Figma | Ruta implementada |
|---|---|
| Inicio | `/(tabs)/index` — el raíl “Últimos Episodios” usa estrenos reales agrupados por día (Hoy/Ayer/fecha) vía extensión `/latest-episodes`; debajo se conserva “Continuar Viendo” local |
| DIrectorio | `/(tabs)/directorio` |
| Favoritos / Ver Luego | `/(tabs)/listas` (pestañas del tab-strip) |
| En Emisión / Generos | `/grid` (título + filtros) |
| Reproducción | `/player` |
| Perfil | `/(tabs)/perfil` |
| Frame 81 (menú claro) | Menú “Ajustes y ayuda” de Perfil, adaptado al tema oscuro |

## Pantallas no presentes en Figma (extendidas con el mismo sistema)

- **Detalle de anime** (`/anime`): hero con backdrop/póster + gradiente a `#131313`, título JetBrains Mono 20, chips de metadatos y géneros, sinopsis, acciones y lista de episodios con el componente de fila de Figma.
- **Búsqueda** (`/search`): input oscuro con borde `#2E2E2E`, chips de proveedor, grid de pósters.
- **Grid** (`/grid`): 2/3/5 columnas según breakpoint, skeletons y paginación.
- **Controles del reproductor** (`/player`): barra superior, chips de fuente/formato/SUB-DUB, anterior/siguiente, nota de expiración de enlaces.
- **Configuración / Términos / Ayuda / Acerca de**: filas y cards con los mismos tokens.

## Desviaciones conscientes (documentadas)

1. **Frame 81** usa filas gris claro (`#D9D9D9/#C4C4C4`) con texto negro; al integrarse a Perfil se adaptó a superficies oscuras (`#1B1B1B`, texto blanco) manteniendo estructura, tipografía y chevron.
2. **Avatar del header** en Figma es una foto; en el MVP se usa un icono de usuario sobre `#262626` (sin assets de terceros).
3. **“Anuncio”** del Perfil se sustituye por el panel de estado de la API (funcionalidad real, mismo lenguaje visual).
4. **Cards de “Tipo”** son tipográficas (mismo tamaño 134×207 y estilo) porque el filtro de tipo no existe en el servidor; las de **Géneros** usan la portada real del primer anime de ese género (consulta cacheada 6 h).
5. Las imágenes de póster se sirven a través de `/image-proxy` para evitar bloqueos de hotlink del CDN.

## Responsive

- `< 768 px`: réplica móvil de Figma (bottom tabs, rails horizontales, grids de 2 columnas).
- `≥ 768 px`: sidebar fijo de 224 px (`#1B1B1B`) con marca “LEGIÓN ANIME”, navegación y estado de API; contenido centrado con ancho máximo 1200 px; grids de 3–5 columnas.
- El hero se mantiene a 430×300 máx.; las cards no se estiran.
