import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <header>
        {/* Add your header content here */}
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        {/* Add your footer content here */}
      </footer>
    </div>
  );
}

export default App;
