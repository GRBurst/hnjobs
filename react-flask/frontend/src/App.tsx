import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios';
import './App.css'

async function doLogin(username: string, password: string): Promise<void> {
    try {
        const response = await axios.post('http://localhost:5000/login', {
            username,
            password,
        });
        const token = response.data.token;
        // Save the token to local storage
        localStorage.setItem('token', token);
        console.log(`Token: ${token}`)

    } catch (error) {
        console.error(error);
    }
}

function App() {
  const [count, setCount] = useState(0)
  const [login, setLogin] = useState(false)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>BOOM 💥: Vite + React</h1>
      <div style={{display: "flex", flexDirection: "column"}}>
        <div className="card">
            <button onClick={async () => {
                await doLogin("admin", "secret");
                setLogin(true);
                console.log(`login state: ${login} with localstorage token ${localStorage.getItem("token")}`)
            }}>
                Login
            </button>
            <p>
            Login stuff
            </p>
        </div>
        <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
            </button>
            <p>
            Edit <code>src/App.tsx</code> and save to test HMR
            </p>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
