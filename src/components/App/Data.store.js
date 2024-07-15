// import React from "react";

// this is an application state manager

const NODATA = {};
const NOOP = () => {};

const _state = {
  home: {
    movies: [],
    heroImage: null,
    loading: false,
    currentPage: 0,
    totalPages: 0,
    searchTerm: "",
    searchStartDate: "",
    searchEndDate: "",
  },
  movie: {},
};

// currently lets you fetch root-level properties of _state
// TODO
// async
// support state('foo.bar')
// support state('foo.bar[17]')
// support state('foo.bar[id=123].baz')
export function state(path, value = NODATA) {
  if (value === NODATA) {
    return _state[path];
  }

  if (_state[path] !== value) {
    _observers.forEach(({ observedPath, observer }) => {
      if (observedPath === path) {
        console.log("value, observedPath", value, observedPath);
        observer(value, observedPath);
      }
    });

    _state[path] = value;
  }
}

const _observers = [];
export function observe(path, observer = NOOP) {
  _observers.push({ observedPath: path, observer });
}

// TODO
export function unobserve() {}

export const usePath = (useState, useEffect, path, initialValue = null) => {
  const [valueAtPath, setValueAtPath] = useState(state(path) || initialValue);

  useEffect(() => {
    const observer = () => {
      setValueAtPath(state(path));
    };

    observe(path, observer);

    return () => {
      unobserve(path, observer);
    };
  });

  return valueAtPath;
};
