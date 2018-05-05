module.exports = function atom(value, options) {
  let watchers = {};
  let validator = options && options.validator || function() { return true };

  const transition = (next) => {
    if (!validator(next)) {
      var err = new Error(next + " failed validation");
      err.name = "AssertionError";
      throw err;
    }

    let prev = value;
    value = next;

    Object.keys(watchers).forEach(k => {
      watchers[k](k, atom, prev, next);
    });
  }

  const atom = {
    addWatch: (key, fn) => {
      watchers[key] = fn;
    },
    removeWatch: (key) => {
      delete watchers[key];
    },
    swap: (fn) => {
      const args = [value].concat([].slice.call(arguments, 1));
      transition(fn.apply(null, args));
    },
    reset: (v) => {
      transition(v);
    },
    deref: () => value,
    toString: () => "Atom( " + JSON.stringify(value) + " )",
  };

  return atom;
}