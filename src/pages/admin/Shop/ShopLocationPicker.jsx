import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

function LocationMarker({
  position,
  setPosition,
  setLatitude,
  setLongitude,
}) {

  useMapEvents({

    click(e) {

      const lat =
        e.latlng.lat;

      const lng =
        e.latlng.lng;

      setPosition([
        lat,
        lng,
      ]);

      setLatitude(
        lat.toFixed(7)
      );

      setLongitude(
        lng.toFixed(7)
      );
    },

  });

  return position ? (
    <Marker
      position={position}
    />
  ) : null;
}

const ShopLocationPicker = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}) => {

  const position =
    latitude &&
    longitude
      ? [
          Number(
            latitude
          ),
          Number(
            longitude
          ),
        ]
      : [
          20.5937,
          78.9629,
        ];

  return (

    <MapContainer
      center={position}
      zoom={13}
      style={{
        height:
          "400px",
        width:
          "100%",
        borderRadius:
          "12px",
      }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker
        position={
          latitude &&
          longitude
            ? position
            : null
        }
        setPosition={() => {}}
        setLatitude={
          setLatitude
        }
        setLongitude={
          setLongitude
        }
      />

    </MapContainer>

  );
};

export default ShopLocationPicker;