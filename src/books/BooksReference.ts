import { booksNames, type LanguageName } from './BooksLists';
import { ALL_BOOKS, type BookCode } from './BooksType';
import { cleanBookName } from './Books';

export interface BookReferenceEntry {
  language: LanguageName;
  names: string[];
}

export interface BookReferenceRow {
  code: BookCode;
  entries: BookReferenceEntry[];
}

/**
 * Builds a list of books with their names and abbreviations for given languages,
 * filtered by query. Query is matched (case and whitespace insensitive) against
 * book codes and all names, so both "sng" and "Song of Songs" find the same book.
 */
export function getBooksReference(languages: LanguageName[], query = ''): BookReferenceRow[] {
  const q = cleanBookName(query);
  const allBooks = booksNames as Record<LanguageName, Partial<Record<BookCode, string[]>>>;

  return ALL_BOOKS.map((code) => {
    const entries = languages
      .map((language) => ({
        language,
        names: (allBooks[language]?.[code] ?? []).map(cleanBookName),
      }))
      .filter((entry) => entry.names.length > 0);
    return { code, entries };
  }).filter(
    (row) =>
      row.entries.length > 0 &&
      (q === '' ||
        row.code.toLowerCase().includes(q) ||
        row.entries.some((entry) => entry.names.some((name) => name.includes(q)))),
  );
}
