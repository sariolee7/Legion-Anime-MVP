# Legión Anime — MVP de Streaming y Descubrimiento de Anime

MVP funcional multiplataforma (Android + Web) construido con **React Native + Expo + TypeScript**, conectado en tiempo real a **anime1v-api** (API open source de scraping y resolución de streams). El diseño replica el archivo de Figma del proyecto (`Mejora diseño Legión Anime Full`).

> Estado verificado: la app renderiza en navegador con datos reales, la API responde, los géneros/catálogo/búsqueda/detalle funcionan contra el backend real, y el reproductor resuelve enlaces MP4/HLS reales. El APK se genera con EAS Build (ver sección **APK**).

---

## Estructura del repositorio

```
Proyecto Mvp Legion Anime/
├── app/                  # Aplicación Expo (Expo Router + TypeScript)
│   ├── src/app/          # Rutas (tabs, detalle, búsqueda, grid, player, ajustes…)
│   ├── src/components/   # Design system y componentes compartidos
│   ├── src/features/     # Pantallas por dominio (home, explore, library, profile…)
│   ├── src/services/     # API client (Axios) + endpoints tipados + resolución de streams
│   ├── src/hooks/        # TanStack Query hooks + responsive
│   ├── src/stores/       # Zustand + AsyncStorage (biblioteca e historial, ajustes)
│   ├── src/theme/        # Tokens 1:1 extraídos de Figma
│   └── eas.json          # Perfil "preview" → APK instalable
├── server/               # anime1v-api (Node.js/Express) — clonada desde GitHub
├── design/reference/     # PNGs de referencia exportados de Figma (9 frames)
└── docs/                 # Limitaciones de la API y notas de diseño
```

---

## Requisitos

- Node.js 18+ (verificado con v22.20.0)
- npm 10+
- [Cuenta Expo](https://expo.dev) (gratis) para generar el APK con EAS
- Android Studio / emulador o un dispositivo físico con Expo Go (opcional para probar sin APK)

---

## Puesta en marcha (PC)

### 1. Backend anime1v-api (obligatorio)

```powershell
cd server
npm install
```

Crea `server/.env` (si no existe) con:

```env
PORT=3001
NODE_ENV=development
API_KEYS=dev-anime1v-key
DISABLE_AUTH=false
DISABLE_RATE_LIMIT=true
DAILY_REQUEST_LIMIT=10000
REQUEST_TIMEOUT_MS=20000
DEFAULT_ANIME_DOMAIN=animeav1.com
```

Inicia el servidor:

```powershell
npm run dev        # o: npm start
```

Verifica: `http://localhost:3001/health` → `{"success":true,"status":"ok"}`.

### 2. App (otra terminal)

```powershell
cd app
npm install
# .env ya incluye EXPO_PUBLIC_API_URL=http://localhost:3001 y EXPO_PUBLIC_API_KEY=dev-anime1v-key
npx expo start --web        # Navegador en http://localhost:8081
npx expo start --android    # Emulador/dispositivo Android con Expo Go
npx expo start              # QR para probar en dispositivo
```

### 3. URLs de la API por plataforma

| Plataforma | URL de la API |
|---|---|
| Web (PC) | `http://localhost:3001` |
| Emulador Android | `http://10.0.2.2:3001` |
| Dispositivo físico | `http://<IP-LAN-del-PC>:3001` |

La IP LAN se puede cambiar en caliente desde **Perfil → Configuración → Conexión con la API** (se guarda en el dispositivo). En el APK esto es clave: por defecto apunta a `localhost`, ajústala a la IP de tu PC para que el teléfono alcance el backend.

---

## Funcionalidades implementadas

- **Inicio**: hero “Animes del momento”, Recomendados, **Últimos Episodios estrenados (reales, agrupados por día de publicación: Hoy/Ayer/fecha)** y Continuar Viendo (alimentado por tu reproducción local).
- **Directorio**: rails En Emisión (catálogo reciente), Géneros (23 géneros verificados contra la API) y Tipo (Anime/Película/OVA).
- **Explorar / Grid**: catálogo paginado con scroll infinito, filtro por género del servidor y por tipo en cliente.
- **Búsqueda**: debounce, selector de proveedor (AnimeAV1, AnimeFLV, TioAnime, MonosChinos, JKAnime), estados de carga/error/vacío.
- **Detalle**: poster/banner, título japonés, sinopsis, géneros navegables, score, tipo, episodios completos y acciones Favorito / Siguiendo / Ver Luego / Terminado.
- **Reproductor**: consulta `/episode` → resuelve hasta 4 servidores reales con `/resolve` → reproduce MP4/HLS con `expo-video` (Android) o `<video>` + `hls.js` (web), guarda progreso y reanuda, anterior/siguiente episodio y autoavance.
- **Listas**: Favoritos, Siguiendo, Ver Luego, Terminados, Últimos 30 Vistos y Descartados — persistencia con AsyncStorage.
- **Perfil/Configuración**: preferencias (proveedor, SUB/DUB, autoavance), conexión API editable, limpieza de caché de consultas, estado de la API, términos/ayuda/acerca de.
- **Responsive**: barra inferior en móvil (idéntica a Figma); sidebar + contenido centrado (máx. 1200 px) en web/tablet.

---

## Harness de desarrollo y pruebas (Windows)

El proyecto incluye un harness en `scripts/dev-harness.ps1` que orquesta la API y la app web, con health checks, logs y smoke tests reales. Desde la raíz:

```powershell
npm run harness:setup        # instala dependencias y crea server/.env y app/.env si faltan
npm run harness:start        # arranca API (:3001) + web (:8081), espera health checks y muestra URLs
npm run harness:status       # estado de API/web, últimos episodios e image proxy
npm run harness:smoke        # smoke tests reales: health, catalog, search, info, latest-episodes, image-proxy
npm run harness:smoke:full   # añade /episode y /resolve (reproducción real, puede tardar)
npm run harness:verify       # tsc + lint + export web + smoke completo
npm run harness:verify:fast  # tsc + lint + smoke completo (sin export)
npm run harness:stop         # detiene los procesos de los puertos 3001 y 8081
npm run harness:restart      # stop + start
```

- Logs en `.harness/logs/` (`api.log`, `api.err.log`, `web.log`, `web.err.log`).
- Al arrancar imprime las URLs para web, emulador Android (`10.0.2.2`) y dispositivo físico (IP LAN).
- Script directo si prefieres más control:
  `powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 status`

## Scripts

Desde la raíz:

```powershell
npm run server       # inicia anime1v-api
npm run web          # app en navegador
npm run android      # app en Android (Expo)
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
```

Validaciones ejecutadas en este repo: `npx tsc --noEmit` ✅ · `npx expo lint` ✅ (0 errores) · `npx expo-doctor` ✅ (20/20) · `npx expo export --platform web` ✅ · smoke tests reales de la API (`/catalog`, `/search`, `/info`, `/episode`, `/resolve`, `/image-proxy`) ✅.

---

## APK instalable (EAS Build)

`app/eas.json` ya define el perfil **preview** con `"buildType": "apk"` (no AAB):

```powershell
cd app
npx eas-cli@latest login          # inicia sesión con tu cuenta Expo
npx eas-cli@latest build -p android --profile preview
```

- La primera vez EAS vinculará el proyecto (puede pedir confirmación y escribirá `extra.eas.projectId` en `app.json`).
- Al terminar, EAS entrega un enlace de descarga del **.apk**. Instálalo en el teléfono (permitir “orígenes desconocidos”).
- **Importante**: el APK se compila con `EXPO_PUBLIC_API_URL=http://localhost:3001` (definido en el perfil). Al abrirlo, entra a **Perfil → Configuración → Conexión con la API** y cambia la URL a `http://<IP-LAN-de-tu-PC>:3001` (con el servidor corriendo en tu PC y ambos en la misma red). También puedes editar el `env` del perfil `preview` antes de compilar.
- Alternativa local sin EAS (requiere Android Studio): `npx expo run:android`.
- No se afirma que el APK esté compilado en este repositorio: requiere tu cuenta Expo y ejecutar el comando anterior.

---

## Limitaciones conocidas (API real)

Documentadas en detalle en [`docs/API-LIMITATIONS.md`](docs/API-LIMITATIONS.md):

- No existen endpoints de “populares / en emisión / mejor valorados / estudios / temporadas”. La UI usa catálogo real + lógica local documentada.
- **Extensión local del backend**: se añadió `GET /latest-episodes` a `server/` (scrapea el array `latestEpisodes` real del homepage de AnimeAV1 con `publishedAt`, `media.slug`, `number`) para alimentar “Últimos Episodios” con fechas de estreno reales. Ver `docs/API-LIMITATIONS.md`.
- `status`, `year` y `backdrop` suelen venir `null` en respuestas reales de AnimeAV1; la UI los oculta cuando faltan.
- El filtro por tipo se aplica en cliente sobre las páginas cargadas (el servidor no lo soporta).
- Algunos servidores de video caducan enlaces o devuelven URLs inválidas; el cliente valida la URL y hace fallback entre servidores.
- La API se autoaloja (localhost:3001) y tiene rate limit configurable (desactivado en desarrollo).
- El contenido pertenece a sus titulares; la app no aloja video. El backend es open source (MIT) creado por **FxxMorgan**.

---

## Créditos

- **anime1v-api** — creada y mantenida por **FxxMorgan** ([github.com/FxxMorgan/anime1v-api](https://github.com/FxxMorgan/anime1v-api), MIT). Se conservan sus créditos en headers/consola del servidor.
- **Diseño** — archivo Figma “Mejora diseño Legión Anime Full” del proyecto (frames exportados en `design/reference/`).
- Stack: Expo SDK 58 · React Native 0.88 · Expo Router · TypeScript 6 · TanStack Query v5 · Zustand v5 · Axios · expo-video · hls.js · lucide-react-native.
