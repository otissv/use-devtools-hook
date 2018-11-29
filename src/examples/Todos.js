import React, { Fragment, useReducer, useState } from 'react'

import { useReducerDevtools, useStateDevtools } from '../use-devtools'

export function Todos({ initialCount }) {
  const stateReducer = useReducer(reducer, initialState)
  const [state, dispatch] = useReducerDevtools(
    stateReducer,
    initialState,
    'TODO'
  )

  const addTodo = useFormInput('')

  function handleCheckboxChange(e) {
    const id = parseInt(e.target.dataset.todo, 10)
    e.target.checked
      ? dispatch({ type: 'COMPLETE_TODO', id })
      : dispatch({ type: 'UNCOMPLETE_TODO', id })
  }

  function handleAddClick(e) {
    e.preventDefault()
    if (addTodo.value.trim() !== '') {
      dispatch({ type: 'ADD_TODO', todo: addTodo.value })
    }
  }

  return (
    <Fragment>
      <List items={state} onChange={handleCheckboxChange} />
      <div>
        <input placeholder="Add todo" {...addTodo} />
        <button onClick={handleAddClick}>Add</button>
      </div>
      {sumCompleted(state)}

      <div>
        <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      </div>
    </Fragment>
  )
}

const initialState = [
  { id: 0, content: 'Todo 0', completed: false },
  { id: 1, content: 'Todo 1', completed: false },
  { id: 2, content: 'Todo 2', completed: false },
]

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return initialState

    case 'COMPLETE_TODO': {
      const item = getItem(state, action.id)
      const index = getIndex(state, action.id)

      return item ? update(state)({ ...item, completed: true })(index) : state
    }

    case 'ADD_TODO': {
      const item = {
        id: parseInt(state.length + 1, 10),
        content: action.todo,
        completed: false,
      }
      return [...state, item]
    }

    case 'LOAD_TODOS':
      return state

    case 'REMOVE_TODO':
      return state

    case 'UNCOMPLETE_TODO': {
      const item = getItem(state, action.id)
      const index = getIndex(state, action.id)

      return item ? update(state)({ ...item, completed: false })(index) : state
    }

    default:
      return action.type ? state : action
  }
}

function List({ items, onChange }) {
  return (
    <ul>
      {items.map(({ id, content, completed }) => (
        <li key={id}>
          <label htmlFor={id}>
            <input
              id={id}
              data-todo={id}
              type="checkbox"
              checked={completed}
              onChange={onChange}
            />
            {content}
          </label>
        </li>
      ))}
    </ul>
  )
}

const getItem = (state, id) => state.filter(item => item.id === id)[0]
const getIndex = (state, id) => state.findIndex(item => item.id === id)

function sumCompleted(state) {
  const sum = state.reduce((cnt, item) => (item.completed ? cnt + 1 : cnt), 0)
  return sum === state.length
    ? 'Awesome, all todos completed!'
    : `${sum} of ${state.length} completed`
}

function update(list) {
  return item => {
    return index => {
      return index === 0
        ? [item, ...list.slice(1, list.length)]
        : index === list.length - 1
        ? [...list.slice(0, list.length - 1), item]
        : [...list.slice(0, index), item, ...list.slice(index + 1, list.length)]
    }
  }
}

function useFormInput(initialValue) {
  const inputState = useState(initialValue)
  const [value, setValue] = useStateDevtools(
    inputState,
    initialValue,
    'ADD_INPUT'
  )

  function handleChange(e) {
    setValue(e.target.value)
  }

  return {
    value,
    onChange: handleChange,
  }
}
