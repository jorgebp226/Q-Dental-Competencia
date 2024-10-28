import React from 'react';
import { Amplify } from 'aws-amplify';
import config from './aws-exports';
import DentalClinicsDashboard from './pages/DentalClinicsDashboard';
import './App.css';

Amplify.configure(config);

function App() {
  return (
    <div className="App">
      <DentalClinicsDashboard />
    </div>
  );
}

export default App;