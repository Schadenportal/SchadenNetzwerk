const minKeywordLength = 3;
const maxKeywordLength = 10;

const splitTextIntoKeywordsList = (text: string, keywordLength: number): string[] => {
  const substrings: string[] = [];
  for (let i = 0; i < text.length - keywordLength + 1; i += 1) {
    const item = text.slice(i, i + keywordLength).trim();
    if (item.length >= keywordLength) {
      substrings.push(item);
    }
  }

  return substrings;
};

const getKeywordsList = (text: string): string[] => {
  const keywordsList: string[] = [];
  const newText = text.trim().toLowerCase();
  if (newText.length > 0) {
    for (
      let keywordLength = minKeywordLength;
      keywordLength <= maxKeywordLength;
      keywordLength += 1
    ) {
      if (newText.length > keywordLength) {
        keywordsList.push(...splitTextIntoKeywordsList(newText, keywordLength));
      } else if (!keywordsList.includes(newText)) {
        keywordsList.push(newText);
        break;
      }
    }
  }
  if (text.length > 0) {
    keywordsList.push(text.trim());
  }

  return removeDuplicates(keywordsList);
};

const generateKeywords = (...items: string[]): string[] => {
  const keywords: string[] = [];
  items.forEach((item) => keywords.push(...getKeywordsList(item)));

  return removeDuplicates(keywords);
};

const removeDuplicates = (arr: string[]) => {
  return arr.filter((item, index) => arr.indexOf(item) === index);
};

export default generateKeywords;
