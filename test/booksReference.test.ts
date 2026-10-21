import { describe, expect, test } from '@jest/globals';
import { getBooksReference } from '../src/books/BooksReference';
import { booksNames } from '../src/books/BooksLists';

describe('Books reference', () => {
  test('Lists all books of language without query', () => {
    const rows = getBooksReference(['English']);
    expect(rows.map((r) => r.code)).toStrictEqual(Object.keys(booksNames.English));
  });

  test.each(['Song of Songs', 'songofsongs', 'sng', 'SNG', 'cant'])(
    'Finds Song of Songs by %s',
    (query) => {
      const codes = getBooksReference(['English'], query).map((r) => r.code);
      expect(codes).toContain('SNG');
    },
  );

  test('Returns names for each selected language', () => {
    const [row] = getBooksReference(['English', 'Polish'], 'sng');
    expect(row?.entries.map((e) => e.language)).toStrictEqual(['English', 'Polish']);
    expect(row?.entries[0]?.names).toContain('songofsongs');
  });

  test('Returns nothing for unknown query', () => {
    expect(getBooksReference(['English'], 'xyzzy')).toStrictEqual([]);
  });
});
