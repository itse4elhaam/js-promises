const STATE = {
	FULFILLED: "fulfilled",
	REJECTED: "rejected",
	PENDING: "pending",
}
// the constructor cb takes two parameters, which are shown as resolve and reject which are locally named as onSuccess and onFail
class MyPromise {
	#thenCbs = [];
	#catchCbs = [];
	#state; // will be used to track current status on the promise
	#value;
	#onSuccessBind = this.#onSuccess.bind(this);
	#onFailBind = this.#onFail.bind(this);

	constructor(cb) {
		try {
			cb(this.#onSuccessBind, this.#onFailBind);
		} catch (e) {
			this.#onFail(e);
		}
	}
	#runCallbacks() {
		if (this.#state === STATE.FULFILLED) {
			this.#thenCbs.forEach(callback => {
				callback(this.#value); // doing this because all of the then callbacks are resolved with the value we give to them
			})
			this.#thenCbs = [];
		}
		if (this.#state === STATE.REJECTED) {
			this.#catchCbs.forEach(callback => {
				callback(this.#value);
			})
			this.#catchCbs = [];
		}
	}
	// these are private because we only expose .then .catch . finally
	#onSuccess(value) {
		if (this.#state !== STATE.PENDING) return;
		this.#value = value;
		this.#state = STATE.FULFILLED;
		this.#runCallbacks();
	}
	#onFail(value) {
		if (this.#state !== STATE.PENDING) return;
		this.#value = value;
		this.#state = STATE.REJECTED;
		this.#runCallbacks();
	}

	then(thenCb, catchCb) {
		return new MyPromise((resolve, reject) => {
			this.#thenCbs.push(result => {
				if (thenCb == null) {
					resolve(result);
					return;
				}
				try {
					resolve(thenCb(result));
				} catch (error) {
					resolve(error)
				}
			})
			this.#catchCbs.push(result => {
				if (catchCb == null) {
					reject(result);
					return;
				}
				try {
					resolve(catchCb(result));
				} catch (error) {
					resolve(error)
				}
			})
			this.#runCallbacks();
		})
	}
	catch(cb) {
		this.then(null, cb);
	}
	finally(cn) {

	}
}

module.exports = MyPromise;