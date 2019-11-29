
const states = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
};

const isThenable = maybePromise => maybePromise && typeof maybePromise.then === 'function';

class LLJSPromise {
  constructor(computation) {
    this._state = states.PENDING;

    this._value = undefined;
    this._reason = undefined;

    this._thenQueue = [];
    this._finallyQueue = [];

    if (typeof computation === 'function') {
      setTimeout(() => {
        try {
          computation(
            this._onFulfilled.bind(this),
            this._onRejected.bind(this)
          );
        } catch (ex) {
          this._onRejected(ex);
        }
      });
    }
  }

  then(fulfilledFn, catchFn) {
    const controlledPromise = new LLJSPromise();
    this._thenQueue.push([controlledPromise, fulfilledFn, catchFn]);

    if (this._state === states.FULFILLED) {
      this._propagateFulfilled();
    } else if (this._state === states.REJECTED) {
      this._propagateRejected();
    }

    return controlledPromise;
  }

  catch(catchFn) {
    return this.then(undefined, catchFn);
  }

  finally(sideEffectFn) {
    if (this._state !== states.PENDING) {
      sideEffectFn();

      return this._state === states.FULFILLED
      ? LLJSPromise.resolve(this._value)
      : LLJSPromise.reject(this._reason)
    }

    const controlledPromise = new LLJSPromise()
    this._finallyQueue.push([controlledPromise, sideEffectFn]);

    return controlledPromise;
  }

  _propagateFulfilled() {
    this._thenQueue.forEach(([controlledPromise, fulfilledFn]) => {
      if (typeof fulfilledFn === 'function') {
        const valueOrPromise = fulfilledFn(this._value);

        if (isThenable(valueOrPromise)) {
          valueOrPromise.then(
            value => controlledPromise._onFulfilled(value),
            reason => controlledPromise._onRejected(reason)
          );
        } else {
          controlledPromise._onFulfilled(valueOrPromise);
        }
      } else {
        return controlledPromise._onFulfilled(this._value);
      }
    });

    this._finallyQueue.forEach(([controlledPromise, sideEffectFn]) => {
      sideEffectFn();
      controlledPromise._onFulfilled(this._value);
    });

    this._thenQueue = [];
    this._finallyQueue = [];
  }

  _propagateRejected() {
    this._thenQueue.forEach(([controlledPromise, _, catchFn]) => {
      if (typeof catchFn === 'function') {
        const valueOrPromise = catchFn(this._reason);

        if (isThenable(valueOrPromise)) {
          valueOrPromise.then(
            value => controlledPromise._onFulfilled(value),
            reason => controlledPromise._onRejected(reason)
          );
        } else {
          controlledPromise._onFulfilled(valueOrPromise);
        }
      } else {
        return controlledPromise._onRejected(this._reason);
      }
    });

    this._finallyQueue.forEach(([controlledPromise, sideEffectFn]) => {
      sideEffectFn();
      controlledPromise._onRejected(this._value);
    });

    this._thenQueue = [];
    this._finallyQueue = [];
  }


  _onFulfilled(value) {
    if (this._state === states.PENDING) {
      this._state = states.FULFILLED;
      this._value = value;
      this._propagateFulfilled();
    }
  }

  _onRejected(reason) {
    if (this._state === states.PENDING) {
      this._state = states.REJECTED;
      this._reason = reason;
      this._propagateRejected();
    }
  }

}

LLJSPromise.resolve = value => new LLJSPromise(resolve => resolve(value));
LLJSPromise.reject = value => new LLJSPromise((_, reject) => reject(value));




const fs = require('fs');
const path = require('path');

const readFile = (filename, encoding) => new LLJSPromise((resolve, reject) => {
  fs.readFile(filename, encoding, (err, value) => {
    if (err) {
      return reject(err);
    }
    resolve(value);
  })
});

const delay = (timeInMs, value) => new LLJSPromise(resolve => {
  setTimeout(() => {
    resolve(value);
  }, timeInMs);
});


const asyncFn = promiseGeneratorFn => (...args) => {
  const producer = promiseGeneratorFn(...args);

  const interpreter = (lastValue) => {
    const {value, done} = producer.next(lastValue);
    if (!done) {
      if (isThenable(value)) {
        return value.then(
          resolvedValue => interpreter(resolvedValue),
          rejectedValue => interpreter(rejectedValue)
        );
      } else {
        return interpreter(value);
      }
    } else {
      if (!isThenable(value)) {
        return LLJSPromise.resolve(value);
      }
      return value;
    }
  }

  return interpreter();
}

const doAsyncStuff = asyncFn(function* () {
  try {
    const text = yield readFile(path.join(__dirname, 'index.js'), 'utf8');
    console.log(`${text.length} characters read`);

    const withoutVowels = yield delay(2000, text.replace(/[aeiou]/g, ''));
    console.log(withoutVowels.slice(0, 200));
  } catch (err) {
    console.error('An error occured!');
    console.error(err);
  }
  console.log('--- All done! ---');
});

doAsyncStuff();
