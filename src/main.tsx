import React from 'react'
import ReactDOM from 'react-dom/client'
import { IconContext } from 'react-icons'

import App from './App'
import './index.css'
// hsla(197, 40%, 39%, 1)
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <IconContext.Provider
      value={{
        className: 'text-primary',
      }}
    >
      <App />
    </IconContext.Provider>
  </React.StrictMode>
)
