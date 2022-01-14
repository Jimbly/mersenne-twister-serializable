import { createMersenneTwister } from './mersenne.js';
import { int32, random } from './original_data.mjs';

// This seed is the same as the one the original mt19937ar.c uses
let fast = createMersenneTwister([0x123, 0x234, 0x345, 0x456]);

let fastInt32 = Array(1000).fill(0).map(() => fast.randomNumber());
let fastRandom = Array(1000).fill(0).map(() => fast.random().toFixed(8));

// The original mt19937ar.c outputs numbers truncated to 8,
// but JavaScript drops trailing zeroes when it reads them in
let randomStrings = random.map((r) => r.toFixed(8));

let errors = [];

console.log('Testing mersenne-twister-serializable against the original output.');

int32.forEach((orig32, i) => {
  if (orig32 !== fastInt32[i]) {
    errors.push(`INT ${(`000${i + 1}`).slice(-4)}: Computed ${fastInt32[i]}, should have gotten ${orig32}.`);
  }
});

randomStrings.forEach((origRandom, i) => {
  if (origRandom !== fastRandom[i]) {
    errors.push(`RND ${i + 1001}: Computed ${fastRandom[i]}, should have gotten ${origRandom}.`);
  }
});

if (errors.length) {
  errors.forEach((e) => {
    console.error(e);
  });

  throw new Error("Didn't compare cleanly.");
} else {
  console.log('✅');
}
