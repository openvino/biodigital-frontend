import{ useState } from "react";
//@ts-ignore 
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

export default function Map({ onLocationSelect, multiple = false }: { onLocationSelect: (coords: any) => void, multiple?: boolean }) {

    const [markers, setMarkers] = useState<{ lat: number, lng: number }[]>([]);

    function MapClickHandler() {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                console.log(lat, lng);
                if (multiple) {
                    let newMarkers = [...markers, { lat, lng }];
                    if (newMarkers.length > 4) {
                        newMarkers.shift(); // Eliminar el primer marcador
                    }
                    setMarkers(newMarkers);
                    onLocationSelect(newMarkers);
                } else {
                    setMarkers([{ lat, lng }]);
                    onLocationSelect([{ lat, lng }]);
                }
            }
        });
        return null;
    }

    return (
        <MapContainer center={[-32.88949744090918, -68.84494767568468]} zoom={13}>
            <MapClickHandler />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers.map((marker, idx) => (
                <Marker key={idx} position={[marker.lat, marker.lng]} >
                    <Popup>
                        {`Lat: ${marker.lat}, Lng: ${marker.lng}`}
                    </Popup>
                   
                </Marker>
            ))}
        </MapContainer>
    );
}
