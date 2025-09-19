import React from 'react';
import InfiniteCanvas from './components/InfiniteCanvas';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Tasky - Infinite Canvas</h1>
      </header>
      <main className="App-main">
        <InfiniteCanvas />
      </main>
    </div>
  );
}

export default App;