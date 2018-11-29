import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStateDevtools } from './use-devtools'

import { Todos } from './examples/Todos'

window.__USE_DEVTOOLS__ = true

export default function App() {
  const initialState = 0
  const countState = useState(initialState)
  const [count, setCount] = useStateDevtools(countState, initialState, 'COUNT')

  function handleDecrement(e) {
    e.preventDefault()
    setCount(count - 1)
  }

  function handleIncrement(e) {
    e.preventDefault()
    setCount(count + 1)
  }

  return (
    <div>
      <div>
        Count is {count} <button onClick={handleDecrement}> - </button>
        <button onClick={handleIncrement}>+</button>
      </div>

      <div>
        <Todos />
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
