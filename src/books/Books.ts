import { booksNames, type LanguageName } from './BooksLists';
import { ObsidianYouversionLinkerSettings } from '../settings/SettingsData';
import { ALL_BOOKS, type BookCode } from './BooksType';
import { bookRegex } from '../Regex';

let books: Record<BookCode, string[]> | null = null;

export function generateBooksList(settings: ObsidianYouversionLinkerSettings) {
  const activeBooks = Object.fromEntries<string[]>(ALL_BOOKS.map((book) => [book, []])) as Record<
    BookCode,
    string[]
  >;

  const allBooks = booksNames as Record<LanguageName, Record<BookCode, string[]>>;

  settings.selectedBooksLanguages.forEach((lang_name) => {
    const lang = allBooks[lang_name];
    Object.keys(activeBooks).forEach((book) => {
      const names = lang[book as BookCode];
      if (names) activeBooks[book as BookCode].push(...names.map(cleanBookName));
    });
  });
  return activeBooks;
}

export function hasDeuterocanonicalBooks(lang: LanguageName): boolean {
  return Object.keys(booksNames[lang]).length === ALL_BOOKS.length;
}

export default function getBooks(
  str: string,
  settings: ObsidianYouversionLinkerSettings,
): Array<string> {
  str = cleanBookName(str);
  if (books == null) books = generateBooksList(settings);
  return Object.keys(books).filter((key) => books![key as BookCode].includes(str));
}

/**
 * Finds the book at the start of the query. Some book names end with a digit (eg. Korean "요1"),
 * so the book regex is greedy about a trailing digit. When that doesn't give a known book, retry
 * without it, so references with no space before the chapter (eg. "john3:16") still work.
 */
export function findBook(
  query: string,
  settings: ObsidianYouversionLinkerSettings,
): { book: string; books: Array<string> } | null {
  const book = query.match(bookRegex)?.[0];
  if (!book) return null;

  const candidates = /\d$/.test(book) ? [book, book.slice(0, -1)] : [book];
  for (const candidate of candidates) {
    const books = getBooks(candidate, settings);
    if (books.length) return { book: candidate, books };
  }
  return { book, books: [] };
}

export function cleanBookName(book: string): string {
  return book.toLowerCase().replace(/\s/g, '');
}
