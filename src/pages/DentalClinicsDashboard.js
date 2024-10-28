import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { MapPin, Clock, Star, Users, Globe } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API } from 'aws-amplify'

// Arreglar el problema del icono de marcador en React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Función para estimar el tiempo caminando
const estimateWalkingTime = (distanceKm) => {
    const walkingSpeedKmH = 4.5; // Velocidad promedio caminando
    const routeFactor = 1.3; // Factor para rutas no lineales
    return (distanceKm * routeFactor) / walkingSpeedKmH * 60; // Tiempo en minutos
};

const DentalClinicsDashboard = () => {
    const [radius, setRadius] = useState(1);
    const [clinicsData, setClinicData] = useState([]);
    const [mapCenter, setMapCenter] = useState([40.4168, -3.7038]); // Coordenadas de Madrid
    const [mapZoom, setMapZoom] = useState(13);
    const [filteredClinics, setFilteredClinics] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(null); // Estado para saber qué filtro está seleccionado

    const qDental = useMemo(() => ({
        title: "Q-Dental",
        location: { lat: 40.4343653, lng: -3.7041189 }, // Coordenadas de Madrid
        reviewsCount: 258,
        totalScore: 4.8
    }), []);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const apiData = await API.get('clinicsApi', '/api/clinics');
                setClinicData(apiData);
            } catch (error) {
                console.error('Error fetching clinic data:', error);
            }
        };
    
        fetchClinics();
    }, []);

    const clinicsInRadius = useMemo(() => {
        return clinicsData.filter(clinic => {
            const distance = calculateDistance(
                qDental.location.lat,
                qDental.location.lng,
                clinic.location.lat,
                clinic.location.lng
            );
            return distance <= radius;
        });
    }, [radius, clinicsData, qDental]);

    const statistics = useMemo(() => {
        const betterReviews = clinicsInRadius.filter(c => c.reviewsCount > qDental.reviewsCount);
        const betterScore = clinicsInRadius.filter(c => c.totalScore > qDental.totalScore);

        return {
            betterReviewsCount: betterReviews.length,
            betterScoreCount: betterScore.length,
            betterReviews,
            betterScore
        };
    }, [clinicsInRadius, qDental]);

    const maxWalkingTime = estimateWalkingTime(radius);

    // Generar datos para el gráfico de barras de palabras más mencionadas
    const tagsFrequency = useMemo(() => {
        const tagCounts = {};
        clinicsInRadius.forEach(clinic => {
            clinic.reviewsTags.forEach(tag => {
                if (tagCounts[tag.title]) {
                    tagCounts[tag.title] += tag.count;
                } else {
                    tagCounts[tag.title] = tag.count;
                }
            });
        });
        return Object.entries(tagCounts).map(([title, count]) => ({ title, count }));
    }, [clinicsInRadius]);

    const handleFilterClinics = (type) => {
        if (selectedFilter === type) {
            // Si el filtro ya está seleccionado, deseleccionarlo
            setSelectedFilter(null);
            setFilteredClinics([]);
        } else {
            // Si el filtro no está seleccionado, aplicar el filtro
            setSelectedFilter(type);
            if (type === "reviews") {
                setFilteredClinics(statistics.betterReviews);
            } else if (type === "score") {
                setFilteredClinics(statistics.betterScore);
            }
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard de Competencia - Q-Dental</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Control del radio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Radio de búsqueda: {radius} km</label>
                            <Slider
                                value={[radius]}
                                onValueChange={([value]) => setRadius(value)}
                                min={0.1}
                                max={5}
                                step={0.1}
                            />
                        </div>

                        {/* Mapa */}
                        <div className="h-96 rounded-lg overflow-hidden">
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[qDental.location.lat, qDental.location.lng]}>
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold">{qDental.title}</h3>
                                            <p>{qDental.reviewsCount} reseñas</p>
                                            <p>Puntuación: {qDental.totalScore}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={[qDental.location.lat, qDental.location.lng]}
                                    radius={radius * 1000}
                                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                                />
                                {clinicsInRadius.map((clinic, index) => (
                                    <Marker key={index} position={[clinic.location.lat, clinic.location.lng]}>
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold">{clinic.title}</h3>
                                                <img src={clinic.imageUrl} alt={clinic.title} className="w-full h-24 object-cover rounded" />
                                                <p>{clinic.reviewsCount} reseñas</p>
                                                <p>Puntuación: {clinic.totalScore}</p>
                                                <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Sitio Web</a>
                                                <ul>
                                                    {clinic.reviewsTags.map((tag, i) => (
                                                        <li key={i}>{tag.title}: {tag.count}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* Estadísticas con filtro y selección visual */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card
                                onClick={() => handleFilterClinics("reviews")}
                                className={`cursor-pointer ${selectedFilter === "reviews" ? "bg-blue-100 border-blue-400" : ""}`}
                            >
                                <CardContent className="p-4 flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{statistics.betterReviewsCount}</p>
                                        <p className="text-sm text-gray-500">Más reseñas que Q-Dental</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                onClick={() => handleFilterClinics("score")}
                                className={`cursor-pointer ${selectedFilter === "score" ? "bg-blue-100 border-blue-400" : ""}`}
                            >
                                <CardContent className="p-4 flex items-center space-x-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{statistics.betterScoreCount}</p>
                                        <p className="text-sm text-gray-500">Mejor puntuación que Q-Dental</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{Math.round(maxWalkingTime)}</p>
                                        <p className="text-sm text-gray-500">Minutos máx. caminando</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gráfico de barras con palabras más mencionadas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Palabras más mencionadas en el radio seleccionado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={tagsFrequency}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="title" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Lista de clínicas con filtro aplicado */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Clínicas en el radio ({filteredClinics.length || clinicsInRadius.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {(filteredClinics.length ? filteredClinics : clinicsInRadius).map((clinic, index) => (
                                        <div key={index} className="p-2 border rounded flex items-center space-x-4">
                                            <img src={clinic.imageUrl} alt={clinic.title} className="w-16 h-16 object-cover rounded" />
                                            <div>
                                                <p className="font-medium">{clinic.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {clinic.reviewsCount} reseñas · {clinic.totalScore} ⭐
                                                </p>
                                                <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Sitio Web</a>
                                            </div>
                                            <a href={clinic.url} target="_blank" rel="noopener noreferrer">
                                                <MapPin className="h-5 w-5 text-gray-400 cursor-pointer" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DentalClinicsDashboard;
