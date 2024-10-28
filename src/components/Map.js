import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglar el problema del icono de marcador en React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ qDental, clinicsInRadius, radius }) => {
  return (
    <MapContainer
      center={[qDental.location.lat, qDental.location.lng]}
      zoom={13}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Marcador de Q-Dental */}
      <Marker position={[qDental.location.lat, qDental.location.lng]}>
        <Popup>
          <div className="p-2">
            <h3 className="font-bold">{qDental.title}</h3>
            <p>{qDental.reviewsCount} reseñas</p>
            <p>Puntuación: {qDental.totalScore}</p>
          </div>
        </Popup>
      </Marker>

      {/* Círculo que muestra el radio */}
      <Circle
        center={[qDental.location.lat, qDental.location.lng]}
        radius={radius * 1000} // Convertir km a metros
        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
      />

      {/* Marcadores de otras clínicas */}
      {clinicsInRadius.map((clinic, index) => (
        <Marker 
          key={index}
          position={[clinic.location.lat, clinic.location.lng]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{clinic.title}</h3>
              <p>{clinic.reviewsCount} reseñas</p>
              <p>Puntuación: {clinic.totalScore}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;