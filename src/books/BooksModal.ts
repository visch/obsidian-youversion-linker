import { App, Modal, Setting } from 'obsidian';
import { booksNames, type LanguageName } from './BooksLists';
import { getBooksReference } from './BooksReference';
import { cleanBookName } from './Books';

export default class BooksModal extends Modal {
  query = '';
  showAllLanguages = false;
  selectedLanguages: LanguageName[];
  resultsEl: HTMLElement | null = null;

  constructor(app: App, selectedLanguages: LanguageName[]) {
    super(app);
    this.selectedLanguages = selectedLanguages;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass('books-modal-youversion');
    this.titleEl.setText('Book names and abbreviations');

    contentEl.createEl('p', {
      cls: 'books-modal-desc',
      text: 'Names are matched ignoring case and spaces. Search by name, abbreviation or book code.',
    });

    new Setting(contentEl)
      .addSearch((search) => {
        search.setPlaceholder('Search by name or code');
        search.onChange((value) => {
          this.query = value;
          this.renderResults();
        });
        window.setTimeout(() => search.inputEl.focus(), 0);
      })
      .addToggle((toggle) => {
        toggle.setTooltip('Show all languages, not only the selected ones');
        toggle.setValue(this.showAllLanguages);
        toggle.onChange((value) => {
          this.showAllLanguages = value;
          this.renderResults();
        });
      })
      .setName('All languages')
      .settingEl.addClass('books-modal-search');

    this.resultsEl = contentEl.createDiv({ cls: 'books-modal-results' });
    this.renderResults();
  }

  renderResults() {
    if (!this.resultsEl) return;
    this.resultsEl.empty();

    const languages = this.showAllLanguages
      ? (Object.keys(booksNames) as LanguageName[]).sort()
      : this.selectedLanguages;
    const rows = getBooksReference(languages, this.query);
    const q = cleanBookName(this.query);

    if (rows.length === 0) {
      this.resultsEl.createDiv({ cls: 'books-modal-empty', text: 'No books found.' });
      return;
    }

    const table = this.resultsEl.createEl('table');
    const head = table.createEl('thead').createEl('tr');
    head.createEl('th', { text: 'Code' });
    if (languages.length > 1) head.createEl('th', { text: 'Language' });
    head.createEl('th', { text: 'Names and abbreviations' });

    const body = table.createEl('tbody');
    rows.forEach((row) => {
      row.entries.forEach((entry, index) => {
        const tr = body.createEl('tr');
        if (index === 0)
          tr.createEl('td', {
            cls: 'books-modal-code',
            text: row.code,
            attr: { rowspan: row.entries.length },
          });
        if (languages.length > 1) tr.createEl('td', { text: entry.language });
        const namesEl = tr.createEl('td');
        entry.names.forEach((name) => {
          const chip = namesEl.createEl('code', { text: name });
          if (q !== '' && name === q) chip.addClass('books-modal-match');
        });
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
