import { useEffect, useState } from "react";

export type Letter = {
  character: string;
  isDismissed: boolean;
};

// Durstenfeld shuffle algorithm - https://stackoverflow.com/a/12646864/6806381
function shuffleLetters(letters: Array<Letter>): Array<Letter> {
  const array = [...letters];

  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export function sanitiseQuery(query: string): string {
  return query
    .split("")
    .map((x) => x.trim())
    .filter(Boolean)
    .join("");
}

export function queryToBlankNewWord(query: string): string[] {
  return new Array(sanitiseQuery(query).length).fill("");
}

export function queryToLetters(query: string): Array<Letter> {
  return sanitiseQuery(query)
    .split("")
    .map((character) => ({ character, isDismissed: false }));
}

export function findNextBlankLetter(word: string[], startIndex: number): number {
  let count = 0;
  let index = startIndex % word.length;
  while (count < word.length) {
    if (word[index] === "") {
      return index;
    } else {
      index = (index + 1) % word.length;
    }
    count++;
  }
  return -1;
}

export function useAnagramState(searchQuery: string) {
  const [letters, setLetters] = useState<Array<Letter>>(
    queryToLetters(searchQuery)
  );
  const [newWord, setNewWord] = useState<string[]>(
    queryToBlankNewWord(searchQuery)
  );
  const [indexOfNewWord, setIndexOfNewWord] = useState(0);
  const [undoStack, setUndoStack] = useState<number[]>([]);

  useEffect(() => {
    setLetters(queryToLetters(searchQuery));
    setNewWord(queryToBlankNewWord(searchQuery));
    setIndexOfNewWord(0);
    setUndoStack([]);
  }, [searchQuery]);

  const placeLetter = (letterIndex: number) => {
    const character = letters[letterIndex].character;
    const updatedLetters = [...letters];
    updatedLetters[letterIndex] = { ...updatedLetters[letterIndex], isDismissed: true };
    setLetters(updatedLetters);

    const updatedWord = [...newWord];
    updatedWord[indexOfNewWord] = character;
    setNewWord(updatedWord);
    setUndoStack((prev) => [...prev, indexOfNewWord]);
    setIndexOfNewWord(findNextBlankLetter(updatedWord, indexOfNewWord));
  };

  const removeLetter = (wordIndex: number) => {
    if (newWord[wordIndex] === "") {
      setIndexOfNewWord(wordIndex);
      return;
    }

    const character = newWord[wordIndex];
    const updatedWord = [...newWord];
    updatedWord[wordIndex] = "";
    setNewWord(updatedWord);

    const updatedLetters = [...letters];
    const letterIdx = updatedLetters.findIndex(
      ({ character: c, isDismissed }) => c === character && isDismissed
    );
    if (letterIdx > -1) {
      updatedLetters[letterIdx] = { ...updatedLetters[letterIdx], isDismissed: false };
      setLetters(updatedLetters);
    }

    setUndoStack((prev) => {
      const lastIdx = prev.findLastIndex((entry) => entry === wordIndex);
      return lastIdx > -1 ? prev.filter((_, idx) => idx !== lastIdx) : prev;
    });
    setIndexOfNewWord(wordIndex);
  };

  const undo = () => {
    if (undoStack.length === 0) return;

    const wordIndex = undoStack[undoStack.length - 1];
    const character = newWord[wordIndex];

    const updatedWord = [...newWord];
    updatedWord[wordIndex] = "";
    setNewWord(updatedWord);

    const updatedLetters = [...letters];
    const letterIdx = updatedLetters.findIndex(
      (l) => l.character === character && l.isDismissed
    );
    if (letterIdx > -1) {
      updatedLetters[letterIdx] = {
        ...updatedLetters[letterIdx],
        isDismissed: false,
      };
      setLetters(updatedLetters);
    }

    setIndexOfNewWord(wordIndex);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const clear = () => {
    setIndexOfNewWord(0);
    setNewWord(queryToBlankNewWord(searchQuery));
    setLetters((value) =>
      value.map((letter) => ({ ...letter, isDismissed: false }))
    );
    setUndoStack([]);
  };

  const shuffle = () => {
    setLetters(shuffleLetters(letters));
  };

  const goToNextBlank = () => {
    const nextIndex = findNextBlankLetter(newWord, indexOfNewWord + 1);
    setIndexOfNewWord(nextIndex);
  };

  return {
    letters,
    newWord,
    indexOfNewWord,
    undoStack,
    placeLetter,
    removeLetter,
    undo,
    clear,
    shuffle,
    goToNextBlank,
  };
}
