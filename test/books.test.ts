import { booksNames } from '../src/books/BooksLists';
import { testBookRegex } from '../src/Regex';
import { cleanBookName, findBook } from '../src/books/Books';
import {
  DEFAULT_SETTINGS,
  type ObsidianYouversionLinkerSettings,
} from '../src/settings/SettingsData';
import { describe, expect, test } from '@jest/globals';
import { ALL_BOOKS, BASE_BOOKS } from '../src/books/BooksType';

describe('Book names', () => {
  test.each(Object.entries(booksNames))('All book names are valid for %s', (_lang, list) => {
    Object.values(list).forEach((names) => {
      expect(names.length).toBeGreaterThan(0);
      names.map(cleanBookName).forEach((n) => {
        expect(typeof n).toBe('string');
        expect(n).toMatch(testBookRegex);
      });
    });
  });

  test.each(Object.entries(booksNames))('All books keys are unique for %s', (_lang, list) => {
    const keys = new Set(Object.keys(list));
    expect(keys.size).toBe(Object.keys(list).length);
  });

  test.each(Object.entries(booksNames))(
    'Contains only base books or all books for %s',
    (_lang, list) => {
      const keys = new Set(Object.keys(list));
      if (keys.size <= BASE_BOOKS.length) {
        expect(keys).toStrictEqual(new Set(BASE_BOOKS));
      } else {
        expect(keys).toStrictEqual(new Set(ALL_BOOKS));
      }
    },
  );
});

describe('Find book', () => {
  const settings: ObsidianYouversionLinkerSettings = {
    ...DEFAULT_SETTINGS,
    selectedBooksLanguages: ['English', 'Korean'],
  };

  test.each([
    ['john 3:16', 'john', 'JHN'],
    ['john3:16', 'john', 'JHN'],
    ['gen1:1', 'gen', 'GEN'],
    ['ps23', 'ps', 'PSA'],
    ['1 john1:9', '1 john', '1JN'],
    ['1cor13', '1cor', '1CO'],
    ['song2:1', 'song', 'SNG'],
    ['요1 1:9', '요1', '1JN'],
  ])('finds book in "%s"', (query, book, code) => {
    expect(findBook(query, settings)).toStrictEqual({ book, books: [code] });
  });

  test('returns no books for unknown book', () => {
    expect(findBook('xyz3:16', settings)?.books).toStrictEqual([]);
  });
});
