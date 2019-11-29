const interpreterLog = (...args) => console.log('[interpreter]', ...args);
const producerLog = (...args) => console.log('\t[producer]', ...args);

const producerGeneratorFn = function* (argumentValue) {
  producerLog('function argument:', argumentValue);
  const a = yield 1;
  producerLog('a was:', a);
  const b = yield 2;
  producerLog('b was:', b);
  return 3;
};

const interpreter = generatorFn => {
  interpreterLog('Creating the generator object');
  const producer = generatorFn("starting value");
  let done = false;
  let lastValue = undefined;

  while (!done) {
    let produced = producer.next(100 * lastValue);
    interpreterLog('Got produced', produced);
    done = produced.done;
    lastValue = produced.value;
  }

 };

interpreter(producerGeneratorFn);
