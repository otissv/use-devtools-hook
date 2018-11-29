import { useState, useEffect, useRef } from 'react'

export function useDevtools([state, dispatch], initialState, name, reducer) {
  const [devtools, setDevtools] = useState()
  const skippedActionIds = useRef([])
  const stagedActions = useRef([])

  // Check if extension is loaded
  const withDevtools =
    typeof window !== 'undefined' &&
    window.__USE_DEVTOOLS__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.devToolsExtension

  // Toggle skipped action
  function toggleAction({ id, state }) {
    const liftedState = JSON.parse(state)
    const idx = skippedActionIds.current.indexOf(id)
    const skipped = idx !== -1

    // Toggle action in dev tools ui
    if (skipped) {
      skippedActionIds.current.splice(idx, 1)
      liftedState.skippedActionIds = skippedActionIds.current
    } else {
      skippedActionIds.current.push(id)
      liftedState.skippedActionIds = skippedActionIds.current
    }
    return liftedState
  }

  function subscribeReducer(message) {
    if (message.type === 'DISPATCH') {
      switch (message.payload.type) {
        case 'COMMIT': {
          reducer({ type: 'COMMIT', payload: null })
          return
        }
        case 'IMPORT_STATE': {
          const { nextLiftedState } = message.payload
          const { computedStates } = nextLiftedState
          reducer({
            type: 'IMPORT_STATE',
            payload: computedStates[computedStates.length - 1].state,
          })
          devtools.send(null, nextLiftedState)
          return
        }
        case 'JUMP_TO_STATE':
          reducer({
            type: 'JUMP_TO_ACTION',
            payload: JSON.parse(message.state),
          })
          return
        case 'JUMP_TO_ACTION': {
          reducer({
            type: 'JUMP_TO_ACTION',
            payload: JSON.parse(message.state),
          })
          return
        }
        case 'RESET': {
          devtools.init(initialState)
          reducer({ type: 'RESET', payload: initialState })
          return
        }
        case 'ROLLBACK': {
          devtools.init(JSON.parse(message.state))
          reducer({ type: 'ROLLBACK', payload: JSON.parse(message.state) })
          return
        }
        case 'SWEEP': {
          reducer({ type: 'SWEEP', payload: null })
          return
        }
        case 'TOGGLE_ACTION': {
          const liftedState = toggleAction({
            id: message.payload.id,
            state: message.state,
          })
          devtools.send(null, liftedState)

          // Reset state
          dispatch(initialState)

          // Dispatch non skipped action
          stagedActions.current.forEach((item, index) => {
            skippedActionIds.current.indexOf(index + 1) === -1 && dispatch(item)
          })

          reducer({
            type: 'TOGGLE_ACTION',
            payload: {
              id: message.payload.id,
              state: JSON.parse(message.state),
            },
          })

          return
        }

        default:
          return
      }
    }
  }

  useEffect(
    () => {
      if (withDevtools && !devtools) {
        // Connect to dev tools
        setDevtools(
          withDevtools.connect({
            name,
          })
        )
      }

      if (devtools) {
        // Set initial value
        devtools.init(state)

        // Subscribe to dev tools messages
        devtools.subscribe(subscribeReducer)
      }

      return () => {
        devtools && devtools.disconnect()
      }
    },
    [devtools]
  )

  useEffect(
    () => {
      if (devtools) {
        const devState = stagedActions.current[stagedActions.current.length - 1]

        devState.type
          ? devtools.send(devState.type, state)
          : devtools.send(name ? `[${name}] UPDATE` : 'UPDATE', devState)
      }
    },
    [stagedActions.current[stagedActions.current.length - 1]]
  )

  return [
    state,
    props => {
      stagedActions.current.push(props)
      dispatch(props)
    },
  ]
}

export function useReducerDevtools([state, dispatch], initialState, name) {
  function reducer(action) {
    switch (action.type) {
      case 'IMPORT_STATE':
      case 'JUMP_TO_STATE':
      case 'JUMP_TO_ACTION':
      case 'RESET':
      case 'ROLLBACK':
        dispatch(action.payload)
        return
      default:
        return
    }
  }

  return useDevtools([state, dispatch], initialState, name, reducer)
}

export function useStateDevtools([state, dispatch], initialState, name) {
  function reducer(action) {
    switch (action.type) {
      case 'IMPORT_STATE':
      case 'JUMP_TO_STATE':
      case 'JUMP_TO_ACTION':
      case 'RESET':
      case 'ROLLBACK':
        dispatch(action.payload)
        return
      default:
        return
    }
  }

  return useDevtools([state, dispatch], initialState, name, reducer)
}
