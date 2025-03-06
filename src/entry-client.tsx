import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './global.css'

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
