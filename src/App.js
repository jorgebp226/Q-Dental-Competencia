import React from 'react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import DentalClinicsDashboard from './pages/DentalClinicsDashboard';
import './App.css'; // Si tienes estilos globales

// Configurar Amplify
Amplify.configure(awsconfig);

function App() {
  return (
    <div className="App">
      <DentalClinicsDashboard />
    </div>
  );
}

export default App;