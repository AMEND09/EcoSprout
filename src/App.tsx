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
        {/*Application made by Aditya Mendiratta & Matthew Fabricio Cruz for TSA Software Development 2025*/}
      </footer>
    </div>
  );
}

export default App;
