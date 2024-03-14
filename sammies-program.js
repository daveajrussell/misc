// const inputs = [
//     "banana 32",
//     "kiwi 41",
//     "mango 97",
//     "papaya 254",
//     "pineapple 399",
//   ],
const inputs = [
    "apple 59",
    "banana 32",
    "coconut 155",
    "grapefruit 128",
    "jackfruit 1100",
    "kiwi 41",
    "lemon 70",
    "mango 97",
    "orange 73",
    "papaya 254",
    "pear 37",
    "pineapple 399",
    "watermelon 500",
  ],
  fruits = [],
  prices = [],
  vectors = [],
  target = 500;

function program() {
  parseInputs();
  iterateFruits();
}

function parseInputs() {
  inputs.forEach((input, index) => {
    const row = input.split(" ");
    fruits[index] = row[0];
    prices[index] = parseInt(row[1]);
  });
}

function iterateFruits() {
  prices.forEach((price, index) => {
    for (
      let coefficient = Math.floor(target / price);
      coefficient > 0;
      coefficient--
    ) {
      iterateFruitCombinations(coefficient, index, 0, []);
    }
  });
}

function iterateFruitCombinations(coefficient, index, total, vector) {
  total += coefficient * prices[index];
  vector[fruits[index]] = coefficient;

  if (total == target) {
    printVector(vector);
  } else if (total < target) {
    for (
      let coefficient = Math.floor(target / prices[index + 1]);
      coefficient >= 0;
      coefficient--
    ) {
      iterateFruitCombinations(coefficient, index + 1, total, vector);
    }
  }
}

function printVector(vector) {
  const output = Object.entries(vector)
    .filter(([key, value]) => fruits.indexOf(key) >= 0 && value > 0)
    .map(([key, value]) => `${value} ${key}${value > 1 ? "s" : ""}`)
    .join(", ");
  console.log(output);
}

const t0 = performance.now();
program();
const t1 = performance.now();
console.log(`program took ${t1 - t0} milliseconds.`);
