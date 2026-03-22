import {useState, useEffect} from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Root from './components/Root';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'


const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={ <Root /> }>
    <Route index element={ <HomePage /> } />
    <Route path="dashboard" element={ <Dashboard /> } />
  </Route>
));

export default function App() {
  return (
    <main>
      <RouterProvider
        router={ router }
        future={{
          v8_middleware: true,
          v8_splitRouteModules: true,
          v8_viteEnvironmentApi: true
        }}
      />
    </main>
  )
}