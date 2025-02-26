//@ts-nocheck
import { useEffect, useState } from 'react';
import { Devnet } from './components/Devnet';
import { init } from './fhevmjs';
import './App.css';
import { Connect } from './components/Connect';
import { ToastContainer} from 'react-toastify';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analysis } from './components/Analysis/Analysis';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    init()
      .then(() => {
        setIsInitialized(true);
      })
      .catch(() => setIsInitialized(false));
  }, []);

  if (!isInitialized) return null;

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/certify"
            element={
              <Connect>
                {(account, provider, readOnlyProvider) => (
                  <Devnet
                    account={account}
                    provider={provider}
                    readOnlyProvider={readOnlyProvider}
                  />
                )}
              </Connect>
            }
          />
          <Route
            path="/chemical-analysis"
            element={
              <Connect>
                {(account, provider, readOnlyProvider) => (
                  <Analysis
                    account={account}
                    provider={provider}
                    readOnlyProvider={readOnlyProvider}
                  />
                )}
              </Connect>
            }
          />
        </Routes>
      </div>

      <ToastContainer />
    </Router>
  );
}

export default App;
