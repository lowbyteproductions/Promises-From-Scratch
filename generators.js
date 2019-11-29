const interpreterLog = (...args) => console.log('[interpreter]', ...args);
const producerLog = (...args) => console.log('\t[producer]', ...args);

const producerGeneratorFn = function* (argumentValue) {
  producerLog('function argument:', argumentValue);
  yield 1;
  yield 2;
  return 3;
};

const interpreter = generatorFn => {
  interpreterLog('Creating the generator object');
  const producer = generatorFn("starting value");

  let produced = producer.next();
  interpreterLog('Got produced', produced);
  produced = producer.next();
  interpreterLog('Got produced', produced);
  produced = producer.next();
  interpreterLog('Got produced', produced);
  produced = producer.next();
  interpreterLog('Got produced', produced);
};

interpreter(producerGeneratorFn);
