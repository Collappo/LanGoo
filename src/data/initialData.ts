import { WordSet } from '../types';

/**
 * Initial data structure for Linguist app.
 * You can import/export this as JSON in the app settings.
 */
export const initialData: WordSet[] = [
  {
    id: 'set-1',
    name: 'Podstawowe zwroty - Angielski',
    langA: 'Polski',
    langB: 'Angielski',
    createdAt: Date.now(),
    words: [
      { id: '1', wordA: 'Cześć', wordB: 'Hello' },
      { id: '2', wordA: 'Dziękuję', wordB: 'Thank you' },
      { id: '3', wordA: 'Proszę', wordB: 'Please' },
      { id: '4', wordA: 'Przepraszam', wordB: 'Sorry' },
      { id: '5', wordA: 'Tak', wordB: 'Yes' },
      { id: '6', wordA: 'Nie', wordB: 'No' },
      { id: '7', wordA: 'Dzień dobry', wordB: 'Good morning' },
      { id: '8', wordA: 'Dobranoc', wordB: 'Good night' },
      { id: '9', wordA: 'Jak się masz?', wordB: 'How are you?' },
      { id: '10', wordA: 'Do widzenia', wordB: 'Goodbye' },
    ]
  },
  {
    id: 'set-2',
    name: 'Owoce i Warzywa',
    langA: 'Polski',
    langB: 'Angielski',
    createdAt: Date.now(),
    words: [
      { id: 'f1', wordA: 'Jabłko', wordB: 'Apple' },
      { id: 'f2', wordA: 'Banan', wordB: 'Banana' },
      { id: 'f3', wordA: 'Pomarańcza', wordB: 'Orange' },
      { id: 'f4', wordA: 'Truskawka', wordB: 'Strawberry' },
      { id: 'f5', wordA: 'Ziemniak', wordB: 'Potato' },
      { id: 'f6', wordA: 'Pomidor', wordB: 'Tomato' },
      { id: 'f7', wordA: 'Marchewka', wordB: 'Carrot' },
      { id: 'f8', wordA: 'Cebula', wordB: 'Onion' },
    ]
  }
];
