import './App.scss';
import ZoneArchive from './zoneArchive/zoneArchive.js';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <main className="vzi-app">
        <header className="vzi-app__header">
          <ThemeToggle className="vzi-app__theme-toggle" />
        </header>
        <ZoneArchive />
      </main>
    </ThemeProvider>
  );
}

export default App;
