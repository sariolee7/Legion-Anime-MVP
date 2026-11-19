# Limitaciones y adaptaciones — API anime1v-api

Fecha de verificación: **2026-11-19** (smoke tests reales contra `http://localhost:3001` con `X-API-Key: dev-anime1v-key`).

## Naturaleza de la API

- **Self-hosted**: no existe instancia pública documentada. Base URL de desarrollo: `http://localhost:3001`.
- Autenticación: header `X-API-Key` (o `?apiKey=`). En desarrollo usamos `dev-anime1v-key` (definido en `server/.env`).
- Rate limit: `DAILY_REQUEST_LIMIT` (por defecto 100/día). En este proyecto se desactiva con `DISABLE_RATE_LIMIT=true`.
- Base de anime: scraping de AnimeAV1/AnimeFLV/etc. El contenido pertenece a sus titulares; la app no aloja video.

## Endpoints utilizados (verificados)

| Endpoint | Uso en la app | Respuesta real observada |
|---|---|---|
| `GET /catalog?page&provider&genre` | Home, Directorio, Grid | `data.results[]` con `title, url, image, type, provider, slug`; `score/status/year` llegan `null` en catálogo. `hasMore` real |
| `GET /search?q&domain` | Búsqueda | `data.results[]` (mismos campos); `count`; requiere ≥2 caracteres en la UI |
| `GET /info?url` | Detalle | `title, titleJapanese, description, image, status, type, year, score, totalEpisodes, genres[], episodes[]`. En la práctica `status`, `year` y `backdrop` pueden ser `null` |
| `GET /episode?url` | Reproductor | `streamLinks.SUB/DUB[]` con `server` y `url`; `variants` |
| `GET /resolve?url` | Reproductor | `{ server, mediaType, streamUrl, resolvedFrom }`; 404 si ningún servidor resuelve |
| `GET /image-proxy?url` | Todas las imágenes | Imagen binaria (`image/jpeg`), sin auth. Usado para evitar hotlink protection |
| `GET /health` | Estado de la API | `{"success":true,"status":"ok"}` |
| **`GET /latest-episodes?limit`** *(extensión local)* | Home → Últimos Episodios | `data.results[]` con `number`, `publishedAt`, `createdAt`, `animeTitle`, `animeSlug`, `animeUrl`, `url`, `image`. Extraído del array real `latestEpisodes` del homepage de AnimeAV1 (SvelteKit). Verificado: 20 episodios con fechas |

Probado con `q=naruto` (17 resultados) y `/media/naruto` (score 8.02, 220 episodios, géneros Acción/Aventura/Fantasía/Shounen/Artes Marciales).

## Limitaciones funcionales y adaptaciones aplicadas (sin mocks)

1. **El API upstream no tiene endpoints de populares / en emisión / mejor valorados / últimos episodios / estudios / temporadas.**
   - “Animes del momento” y “Recomendados” → catálogo real (orden del proveedor).
   - “En Emisión” (Directorio) → entradas más recientes del catálogo real; es una aproximación documentada, no un filtro de emisión.
   - **“Últimos Episodios” → extensión local del backend** (`GET /api/v1/anime/latest-episodes`) que extrae `latestEpisodes` del homepage real de AnimeAV1 (incluye `publishedAt`, título, slug y número). Se agrupa por día de publicación (Hoy/Ayer/fecha) en el Home. Si la extensión falla, se degrada al historial local sin romper la pantalla.
   - “Continuar Viendo” → historial local real de reproducción (AsyncStorage).
2. **`status`, `year`, `backdrop` nulos con frecuencia** → los chips se omiten cuando el dato no existe; nunca se rellenan con valores inventados.
3. **Sin filtro de estado/orden/puntuación en servidor** → el catálogo se consume paginado y se ordena/filtra solo lo que el usuario ve (p. ej., Tipo se filtra en cliente sobre páginas cargadas).
4. **Géneros**: no hay endpoint `/genres`. Se verificaron 29 slugs; 23 aplican filtro real y 6 fueron ignorados silenciosamente por el upstream (fantasía, shojo, thriller, demonios, magia, slice-of-life) → excluidos de la UI.
5. **Proveedores de catálogo**: animeav1, animeflv, jkanime, tioanime, monoschinos. El servidor hace fallback a AnimeAV1 cuando el proveedor no implementa `getCatalog`. HentaiLA se excluyó deliberadamente de la UI.
6. **Resolución de video**:
   - `/resolve` devuelve el primer servidor exitoso; se observó que MP4Upload puede devolver una URL `.css` (falso positivo del upstream). El cliente valida extensión (`mp4/m3u8/webm`) y descarta `.css/.js/.html`, probando hasta 4 servidores.
   - HLS (`zilla`) y UPNShare devolvieron 404 en una prueba; YourUpload resolvió a MP4 reproducible.
   - Los enlaces expiran. La app permite reintentar y re-resolver.
7. **Web + HLS**: Chrome no reproduce `.m3u8` de forma nativa; la app usa `hls.js` (solo web) cuando el navegador no soporta HLS nativo.
8. **Velocidad**: el backend scrapea en vivo (1–10 s por request; algunos proveedores usan Puppeteer). La app usa caché de TanStack Query (5 min catálogo, 24 h info, 10 min enlaces/resolución) y skeletons.
9. **Sin autenticación de usuario**: perfil y listas son locales; no hay backend propio ni cuentas.
10. **Rate limit**: con el límite por defecto (100/día) el uso normal agotaría la cuota; en desarrollo se desactiva. Para producción, configurar un límite mayor o Redis (roadmap del upstream).

## Cómo reproducir las pruebas

```powershell
# con el server corriendo en :3001
$h=@{'X-API-Key'='dev-anime1v-key'}
Invoke-RestMethod 'http://localhost:3001/api/v1/anime/catalog?page=1&provider=animeav1' -Headers $h
Invoke-RestMethod 'http://localhost:3001/api/v1/anime/search?q=naruto&domain=animeav1.com' -Headers $h
Invoke-RestMethod ('http://localhost:3001/api/v1/anime/info?url=' + [uri]::EscapeDataString('https://animeav1.com/media/naruto')) -Headers $h
Invoke-RestMethod ('http://localhost:3001/api/v1/anime/episode?url=' + [uri]::EscapeDataString('https://animeav1.com/media/naruto/1')) -Headers $h
```
