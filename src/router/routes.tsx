import { createBrowserRouter } from 'react-router-dom';
import App from '../App.tsx';
import Default from '../artifacts/default';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Default />,
      }
    ]
  }
], {
  basename: '/farmerappc'
});
