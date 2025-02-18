import { createBrowserRouter } from 'react-router-dom';
import App from '../App.tsx';
import Default from '../artifacts/default';

export const router = createBrowserRouter([
  {
    path: '/farmerapp',
    element: <App />,
    children: [
      {
        path: '',
        element: <Default />,
      }
    ]
  }
]);
