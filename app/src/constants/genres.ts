export interface AnimeGenre {
  slug: string;
  name: string;
}

// Slugs verified against the live AnimeAV1 catalog endpoint (/catalog?genre=).
// Slugs that the upstream API silently ignores were excluded on purpose.
export const GENRES: AnimeGenre[] = [
  { slug: 'accion', name: 'Acción' },
  { slug: 'aventura', name: 'Aventura' },
  { slug: 'ciencia-ficcion', name: 'Ciencia Ficción' },
  { slug: 'comedia', name: 'Comedia' },
  { slug: 'deportes', name: 'Deportes' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'ecchi', name: 'Ecchi' },
  { slug: 'espacial', name: 'Espacial' },
  { slug: 'harem', name: 'Harem' },
  { slug: 'isekai', name: 'Isekai' },
  { slug: 'artes-marciales', name: 'Artes Marciales' },
  { slug: 'mecha', name: 'Mecha' },
  { slug: 'militar', name: 'Militar' },
  { slug: 'misterio', name: 'Misterio' },
  { slug: 'musica', name: 'Música' },
  { slug: 'psicologico', name: 'Psicológico' },
  { slug: 'recuentos-de-la-vida', name: 'Recuentos de la vida' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'seinen', name: 'Seinen' },
  { slug: 'shounen', name: 'Shonen' },
  { slug: 'shoujo', name: 'Shojo' },
  { slug: 'sobrenatural', name: 'Sobrenatural' },
  { slug: 'terror', name: 'Terror' },
  { slug: 'vampiros', name: 'Vampiros' },
];

export const FEATURED_GENRES: AnimeGenre[] = GENRES.filter((genre) =>
  ['accion', 'aventura', 'comedia', 'drama', 'isekai', 'romance', 'shounen', 'shoujo', 'terror'].includes(
    genre.slug
  )
);

// Gradientes propios por género: evitan repetir portadas y dan identidad visual
// cuando la API no devuelve una imagen representativa única.
export const GENRE_GRADIENTS: Record<string, readonly [string, string]> = {
  accion: ['#7A2E2E', '#1C0E0E'],
  aventura: ['#2E5E4E', '#0E1C18'],
  comedia: ['#7A6326', '#1C1710'],
  drama: ['#4A3A6E', '#14101F'],
  isekai: ['#2F4E7A', '#0F1520'],
  romance: ['#7A2E56', '#1D0F18'],
  shounen: ['#7A4A22', '#1D120C'],
  shoujo: ['#7A3A5E', '#1D0F17'],
  terror: ['#3E3E4A', '#101014'],
};

export function genreGradient(slug: string): readonly [string, string] {
  return GENRE_GRADIENTS[slug] ?? ['#3A3A3A', '#141414'];
}


export interface AnimeType {
  id: string;
  name: string;
  matchers: string[];
}

// `type` values come from the anime metadata (e.g. "TV Anime", "Película", "OVA").
// Filtering by type is done client-side over the real catalog results.
export const ANIME_TYPES: AnimeType[] = [
  { id: 'anime', name: 'Anime', matchers: ['tv anime', 'anime', 'tv'] },
  { id: 'pelicula', name: 'Película', matchers: ['película', 'pelicula', 'movie'] },
  { id: 'ova', name: 'OVA', matchers: ['ova'] },
];
