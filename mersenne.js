// Performance note `var` is about 20% faster than `const` for these on Node v16!
var N = 624;

var N_MINUS_1 = 623;
var M = 397;
var M_MINUS_1 = 396;
var DIFF = N - M;
var MATRIX_A = 0x9908b0df;
var UPPER_MASK = 0x80000000;
var LOWER_MASK = 0x7fffffff;

function twist(state) {
  var bits, i;

  // first 624-397=227 words
  for (i = 0; i < DIFF; i++) {
    bits = (state[i] & UPPER_MASK) | (state[i + 1] & LOWER_MASK);

    state[i] = state[i + M] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
  }
  // remaining words (except the very last one)
  for (i = DIFF; i < N_MINUS_1; i++) {
    bits = (state[i] & UPPER_MASK) | (state[i + 1] & LOWER_MASK);

    state[i] = state[i - DIFF] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
  }

  // last word is computed pretty much the same way, but i + 1 must wrap around to 0
  bits = (state[N_MINUS_1] & UPPER_MASK) | (state[0] & LOWER_MASK);

  state[N_MINUS_1] = state[M_MINUS_1] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
}

function initializeWithNumber(state, seed) {
  var s, i;
  // fill initial state
  state[0] = seed;
  for (i = 1; i < N; i++) {
    s = state[i - 1] ^ (state[i - 1] >>> 30);
    // avoid multiplication overflow: split 32 bits into 2x 16 bits and process them individually

    state[i] = (
      (
        (
          (
            (s & 0xffff0000) >>> 16
          ) * 1812433253
        ) << 16
      ) + (s & 0x0000ffff) * 1812433253
    ) + i;
  }
}


/* eslint-disable complexity */
function initializeWithArray(state, seedArray) {
  initializeWithNumber(state, 19650218);
  var len = seedArray.length;

  var i = 1;
  var j = 0;
  var s;
  var k = (N > len ? N : len);

  for (; k; k--) {
    s = state[i - 1] ^ (state[i - 1] >>> 30);

    state[i] = (
      state[i] ^ (
        (
          (
            (
              (s & 0xffff0000) >>> 16
            ) * 1664525
          ) << 16
        ) +
        (
          (s & 0x0000ffff) * 1664525
        )
      )
    ) + seedArray[j] + j;
    i++;
    j++;
    if (i >= N) {
      state[0] = state[N_MINUS_1];
      i = 1;
    }
    if (j >= len) {
      j = 0;
    }
  }
  for (k = N_MINUS_1; k; k--) {
    s = state[i - 1] ^ (state[i - 1] >>> 30);

    state[i] = (
      state[i] ^ (
        (
          (
            (
              (s & 0xffff0000) >>> 16
            ) * 1566083941
          ) << 16
        ) +
        (s & 0x0000ffff) * 1566083941
      )
    ) - i;
    i++;
    if (i >= N) {
      state[0] = state[N_MINUS_1];
      i = 1;
    }
  }

  state[0] = UPPER_MASK; /* MSB is 1; assuring non-zero initial array */
}

// The original algorithm used 5489 as the default seed
function initialize(state, seed = Date.now()) {
  if (Array.isArray(seed)) {
    initializeWithArray(state, seed);
  } else {
    initializeWithNumber(state, seed);
  }
  twist(state);
}

function createMersenneTwister(seed) {
  var state = new Array(N);
  var next = 0;
  function fromJSON(obj) {
    next = obj.n;
    for (var ii = 0; ii < N; ++ii) {
      state[ii] = obj.d[ii];
    }
  }
  if (seed && typeof seed === 'object' && !Array.isArray(seed)) {
    fromJSON(seed);
  } else {
    initialize(state, seed);
  }
  function randomInt32() {
    var x;

    if (next >= N) {
      twist(state);
      next = 0;
    }

    x = state[next++];

    // Tempering
    x ^= x >>> 11;
    x ^= (x << 7) & 0x9d2c5680;
    x ^= (x << 15) & 0xefc60000;
    x ^= x >>> 18;

    // Convert to unsigned
    return x >>> 0;
  }
  var api = {
    // [0,0xffffffff]
    'genrand_int32': randomInt32,
    // [0,0x7fffffff]
    'genrand_int31': function () {
      return randomInt32() >>> 1;
    },
    // [0,1]
    'genrand_real1': function () {
      return randomInt32() * (1.0 / 4294967295.0);
    },
    // [0,1)
    'genrand_real2': function () {
      return randomInt32() * (1.0 / 4294967296.0);
    },
    // (0,1)
    'genrand_real3': function () {
      return (randomInt32() + 0.5) * (1.0 / 4294967296.0);
    },
    // [0,1), 53-bit resolution
    'genrand_res53': function () {
      var a = randomInt32() >>> 5;
      var b = randomInt32() >>> 6;

      return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
    },
    toJSON: function () {
      return { n: next, d: state };
    },
    fromJSON: fromJSON,
  };
  api.randomNumber = randomInt32;
  api.random31Bit = api.genrand_int31;
  api.randomInclusive = api.genrand_real1;
  api.random = api.genrand_real2; // returns values just like Math.random
  api.randomExclusive = api.genrand_real3;
  api.random53Bit = api.genrand_res53;
  api.save = api.toJSON;
  api.restore = fromJSON;

  return api;
}

module.exports = createMersenneTwister;
module.exports.createMersenneTwister = createMersenneTwister;
