# mersenne-twister-serializable

A serializable Mersenne Twister

A modification of [`fast-mersenne-twister`](https://www.npmjs.com/package/fast-mersenne-twister) to support serializing / deserializing (allows to save / restore the seed) and with compatibility enhancements for older browsers/environments.

## Usage

```javascript
const { createMersenneTwister } = require('mersenne-twister-serializable');

let twister = createMersenneTwister(1234567890);

console.log(twister.random()); // 0.6187947695143521

let state = twister.save(); // state is an Object that can be serialized to JSON

console.log(twister.random()); // 0.3405089376028627

twister.restore(state);

console.log(twister.random()); // 0.3405089376028627

let another = createMersenneTwister(state);

console.log(another.random()); // 0.3405089376028627
```

You can also use an array seed:

```javascript
const { createMersenneTwister } = require('mersenne-twister-serializable');

let twister = createMersenneTwister([1234, 5678, 9012]);

console.log(twister.random()); // 0.22977210697717965
```

### Methods

All of the original methods are available on the MersenneTwister object returned by the exported function.

They are also aliased to more readable / convenient names.

| Convenience | Original | Return |
| ----------- | -------- | ------ |
| `randomNumber` | `genrand_int32` | 32 bit integer, [0,0xffffffff] |
| `random31Bit` | `genrand_int31` | 31 bit integer, [0,0x7fffffff] |
| `randomInclusive` | `genrand_real1` | float, [0,1] |
| `random` | `genrand_real2` | float, [0,1) (this is just like what `Math.random()` returns) |
| `randomExclusive` | `genrand_real3` | float, (0,1) |
| `random53Bit` | `genrand_res53` | float, [0,1) with 53-bit resolution |
| `save` | `toJSON` | serializable Object with Number `n` and Array `d` |
| `restore` | `fromJSON` | void |

## Notes

- Extremely true to the [original algorithm by Matsumoto & Nishimura](http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/emt19937ar.html)
- Converted to JavaScript by [Stephan Brumme](https://create.stephan-brumme.com/mersenne-twister/)
  - This version cannot be initialized with an array
- Updated by Thomas Randolph for compliance and performance
	- with all of the original random generators
	- with the ability to be initialized with an array
	- with the correct range (the original only outputs unsigned integers, while Stephan's version outputs signed integers)
- Updated by Jimb Esser
  - with my code style
  - to support saving/restoring
  - to support older browsers/environments
  - performance optimizations
