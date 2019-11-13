const states = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
};

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
          )
        } catch (ex) {}
      });
    }
  }

  then() {

  }

  catch() {

  }

  finally() {

  }

  _propagateFulfilled() {

  }

  _propagateRejected() {

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

const promise = new LLJSPromise((resolve, reject) => {
  setTimeout(() => {
    reject(42);
    resolve(45);
  }, 1000);
});
