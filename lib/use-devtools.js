(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (factory((global.ReactRectanglePopupMenu = {}),global.React));
}(this, (function (exports,react) { 'use strict';

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function useDevtools(_ref, initialState, name, reducer) {
    var _ref2 = _slicedToArray(_ref, 2),
        state = _ref2[0],
        dispatch = _ref2[1];

    var _useState = react.useState(),
        _useState2 = _slicedToArray(_useState, 2),
        devtools = _useState2[0],
        setDevtools = _useState2[1];

    var skippedActionIds = react.useRef([]);
    var stagedActions = react.useRef([]); // Check if extension is loaded

    var withDevtools = typeof window !== 'undefined' && window.__USE_DEVTOOLS__ && window.__REDUX_DEVTOOLS_EXTENSION__ && window.devToolsExtension; // Toggle skipped action

    function toggleAction(_ref3) {
      var id = _ref3.id,
          state = _ref3.state;
      var liftedState = JSON.parse(state);
      var idx = skippedActionIds.current.indexOf(id);
      var skipped = idx !== -1; // Toggle action in dev tools ui

      if (skipped) {
        skippedActionIds.current.splice(idx, 1);
        liftedState.skippedActionIds = skippedActionIds.current;
      } else {
        skippedActionIds.current.push(id);
        liftedState.skippedActionIds = skippedActionIds.current;
      }

      return liftedState;
    }

    function subscribeReducer(message) {
      if (message.type === 'DISPATCH') {
        switch (message.payload.type) {
          case 'COMMIT':
            {
              reducer({
                type: 'COMMIT',
                payload: null
              });
              return;
            }

          case 'IMPORT_STATE':
            {
              var nextLiftedState = message.payload.nextLiftedState;
              var computedStates = nextLiftedState.computedStates;
              reducer({
                type: 'IMPORT_STATE',
                payload: computedStates[computedStates.length - 1].state
              });
              devtools.send(null, nextLiftedState);
              return;
            }

          case 'JUMP_TO_STATE':
            reducer({
              type: 'JUMP_TO_ACTION',
              payload: JSON.parse(message.state)
            });
            return;

          case 'JUMP_TO_ACTION':
            {
              reducer({
                type: 'JUMP_TO_ACTION',
                payload: JSON.parse(message.state)
              });
              return;
            }

          case 'RESET':
            {
              devtools.init(initialState);
              reducer({
                type: 'RESET',
                payload: initialState
              });
              return;
            }

          case 'ROLLBACK':
            {
              devtools.init(JSON.parse(message.state));
              reducer({
                type: 'ROLLBACK',
                payload: JSON.parse(message.state)
              });
              return;
            }

          case 'SWEEP':
            {
              reducer({
                type: 'SWEEP',
                payload: null
              });
              return;
            }

          case 'TOGGLE_ACTION':
            {
              var liftedState = toggleAction({
                id: message.payload.id,
                state: message.state
              });
              devtools.send(null, liftedState); // Reset state

              dispatch(initialState); // Dispatch non skipped action

              stagedActions.current.forEach(function (item, index) {
                skippedActionIds.current.indexOf(index + 1) === -1 && dispatch(item);
              });
              reducer({
                type: 'TOGGLE_ACTION',
                payload: {
                  id: message.payload.id,
                  state: JSON.parse(message.state)
                }
              });
              return;
            }

          default:
            return;
        }
      }
    }

    react.useEffect(function () {
      if (withDevtools && !devtools) {
        // Connect to dev tools
        setDevtools(withDevtools.connect({
          name: name
        }));
      }

      if (devtools) {
        // Set initial value
        devtools.init(state); // Subscribe to dev tools messages

        devtools.subscribe(subscribeReducer);
      }
    }, [devtools]);
    react.useEffect(function () {
      if (devtools) {
        var devState = stagedActions.current[stagedActions.current.length - 1];
        devState.type ? devtools.send(devState.type, state) : devtools.send(name ? "[".concat(name, "] UPDATE") : 'UPDATE', devState);
      }
    }, [stagedActions.current[stagedActions.current.length - 1]]);
    return [state, function (props) {
      stagedActions.current.push(props);
      dispatch(props);
    }];
  }
  function useReducerDevtools(_ref4, initialState, name) {
    var _ref5 = _slicedToArray(_ref4, 2),
        state = _ref5[0],
        dispatch = _ref5[1];

    function reducer(action) {
      switch (action.type) {
        case 'IMPORT_STATE':
        case 'JUMP_TO_STATE':
        case 'JUMP_TO_ACTION':
        case 'RESET':
        case 'ROLLBACK':
          dispatch(action.payload);
          return;

        default:
          return;
      }
    }

    return useDevtools([state, dispatch], initialState, name, reducer);
  }
  function useStateDevtools(_ref6, initialState, name) {
    var _ref7 = _slicedToArray(_ref6, 2),
        state = _ref7[0],
        dispatch = _ref7[1];

    function reducer(action) {
      switch (action.type) {
        case 'IMPORT_STATE':
        case 'JUMP_TO_STATE':
        case 'JUMP_TO_ACTION':
        case 'RESET':
        case 'ROLLBACK':
          dispatch(action.payload);
          return;

        default:
          return;
      }
    }

    return useDevtools([state, dispatch], initialState, name, reducer);
  }

  exports.useDevtools = useDevtools;
  exports.useReducerDevtools = useReducerDevtools;
  exports.useStateDevtools = useStateDevtools;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=use-devtools.js.map
