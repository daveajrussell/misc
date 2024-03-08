const fs = require("fs").promises;
const readline = require("readline");

const memoryAddressChars = "0123456789ABCDEF";
const garbageChars = ":.,;'#~¬`!@$%^&*()[]{}|?<>\\/";
const difficulties = {
  1: { wordLength: 4, wordCount: 5 },
  2: { wordLength: 6, wordCount: 6 },
  3: { wordLength: 8, wordCount: 7 },
  4: { wordLength: 10, wordCount: 8 },
  5: { wordLength: 12, wordCount: 9 },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", function () {
  console.log("SHUTTING DOWN.");
  process.exit(0);
});

const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

function checkGuess(guess, correctWord) {
  if (guess.toUpperCase() === correctWord.toUpperCase())
    return [...correctWord];

  const lettersInCorrectPosition = [];
  [...correctWord].forEach((c, i) => {
    if (c.toUpperCase() === guess[i]?.toUpperCase())
      lettersInCorrectPosition.push(c);
  });

  return lettersInCorrectPosition;
}

async function beginGuesses(correctWord) {
  try {
    let guessed = false;
    let attempt = 0;
    do {
      if (attempt === 3) console.log(">DANGER. LOCKOUT IMMINENT.");

      const guess = await prompt(">");
      console.log(`>${guess.toUpperCase()}.`);

      const result = checkGuess(guess, correctWord);
      guessed = result.length === correctWord.length;

      if (!guessed) console.log(">ACCESS DENIED.");
      else console.log(">ACESS GRANTED.");

      console.log(`>${result.length}/${correctWord.length} CORRECT.`);
      console.log("");

      attempt++;
    } while (!guessed && attempt < 4);
  } catch (e) {
    console.error("Unable to prompt", e);
  } finally {
    rl.close();
  }
}

function getRandomChar() {
  return memoryAddressChars[
    Math.floor(Math.random() * memoryAddressChars.length)
  ];
}

function getRandomMemoryAddress() {
  return (
    "0x" +
    Array.from({ length: 4 })
      .map(() => getRandomChar())
      .join("")
  );
}

function generateGameBoard(garbage) {
  let index = 0;
  let line = "";
  for (const char of garbage) {
    if (index % 11 === 0) {
      line += index > 0 ? " " : "";
      line += getRandomMemoryAddress() + " ";
    }

    line += char;
    index++;

    if (index % 22 === 0) {
      console.log(line);
      line = "";
      index = 0;
    }
  }
}

function generateGarbage(words) {
  const lengthOfWords = words.reduce((p, c) => p + c).length;
  const totalChars = 408;
  const garbageLength = totalChars - lengthOfWords;

  let garbage = "";
  const indexToInsertWord = Math.floor(garbageLength / words.length + 1);
  let currentIndex = 0;

  for (let index = 0; index <= garbageLength; index++) {
    const idx = Math.floor(Math.random() * garbageChars.length);
    garbage += garbageChars[idx];
    if (currentIndex === index) {
      garbage += words.shift();
      currentIndex = currentIndex + indexToInsertWord;
    }
  }
  return garbage;
}

function calculateEntropy(word) {
  const len = word.length;

  const frequencies = Array.from(word).reduce(
    (freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq,
    {}
  );

  return Object.values(frequencies).reduce(
    (sum, f) => sum - (f / len) * Math.log2(f / len),
    0
  );
}

function entropyWithinAcceptableBounds(word1, word2, iteration) {
  const entropy1 = calculateEntropy(word1);
  const entropy2 = calculateEntropy(word2);
  const difference =
    100 * Math.abs((entropy1 - entropy2) / ((entropy1 + entropy2) / 2));
  // more entropy required for acceptable bounds
  return difference > 99 - iteration;
  // less entropy required for acceptable bounds
  //return difference < 0 + iteration;
}

function getNextWord(words, selectedWords) {
  for (let iteration = 0; iteration < words.length; iteration++) {
    const idx = Math.floor(Math.random() * words.length);
    const word = words[idx];

    const allWordsWithinAcceptableBounds = selectedWords.every((selectedWord) =>
      entropyWithinAcceptableBounds(selectedWord, word, iteration)
    );

    if (allWordsWithinAcceptableBounds) {
      return words.splice(idx, 1)[0];
    }
  }
}

async function getWordsOfLength(wordLength) {
  const wordList = await fs.readFile("enable1.txt", "utf8");
  const words = [];

  for (const word of wordList.split("\r\n")) {
    if (word.length === wordLength) {
      words.push(word.toUpperCase());
    }
  }

  return words;
}

async function getRandomWords(wordLength, wordCount) {
  const words = await getWordsOfLength(wordLength);
  const selectedWords = [];

  while (selectedWords.length < wordCount) {
    const word = getNextWord(words, selectedWords);

    if (word) {
      selectedWords.push(word);
    } else {
      break;
    }
  }

  return selectedWords;
}

async function generateGame(wordLength, wordCounts) {
  console.log("\x1b[32m");
  const words = await getRandomWords(wordLength, wordCounts);
  const correctIndex = Math.floor(Math.random() * wordCounts);
  const correctWord = words[correctIndex];
  const garbage = generateGarbage(words);
  generateGameBoard(garbage);
  return correctWord;
}

async function getDifficulty() {
  try {
    const difficulty = await prompt(">DIFFICULTY (1-5)? ");
    return difficulties[difficulty];
  } catch (e) {
    console.error("Unable to prompt", e);
  }
}

async function startGame() {
  const difficulty = await getDifficulty();
  const correctWord = await generateGame(
    difficulty.wordLength,
    difficulty.wordCount
  );
  console.log("");
  await beginGuesses(correctWord);
}

startGame();