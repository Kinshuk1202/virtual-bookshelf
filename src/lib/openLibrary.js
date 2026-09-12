// Thin wrapper around the free, keyless Open Library search API.
// Docs: https://openlibrary.org/dev/docs/api/search

const FIELDS = 'key,title,author_name,first_publish_year,cover_i,number_of_pages_median'

export async function searchBooks(query) {
  const q = query.trim()
  if (!q) return []
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12&fields=${FIELDS}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open Library responded with ${res.status}`)
  const data = await res.json()
  const docs = data.docs || []
  return docs.map((doc) => ({
    olKey: doc.key || null,
    title: doc.title || 'Untitled',
    author: (doc.author_name || [])[0] || '',
    year: doc.first_publish_year || null,
    pages: doc.number_of_pages_median || null,
    cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    coverSmall: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : null,
  }))
}
