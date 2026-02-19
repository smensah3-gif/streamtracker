let _token = null;
let _onUnauthorized = null;

export const tokenStore = {
  set: (t) => { _token = t; },
  get: () => _token,
  clear: () => { _token = null; },
  setOnUnauthorized: (fn) => { _onUnauthorized = fn; },
  triggerUnauthorized: () => { if (_onUnauthorized) _onUnauthorized(); },
};
