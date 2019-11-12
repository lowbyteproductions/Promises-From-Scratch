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
}
