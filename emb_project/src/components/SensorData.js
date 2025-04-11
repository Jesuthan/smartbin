import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

function SensorData() {
  const [fillLevel, setFillLevel] = useState("Loading...");
  const [fillLevelPercentage, setFillLevelPercentage] = useState("Loading...");
  const [temperature, setTemperature] = useState("Loading...");
  const [pressure, setPressure] = useState("Loading...");
  const [latitude, setLatitude] = useState("Loading...");
  const [longitude, setLongitude] = useState("Loading...");

  useEffect(() => {
    const basePath = "devices/esp32_combined_01";

    const ultrasonicRef = ref(db, `${basePath}/ultrasonic`);
    const bmpRef = ref(db, `${basePath}/bmp`);
    const gpsRef = ref(db, `${basePath}/gps`);

    onValue(ultrasonicRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.distance_cm) {
        const distanceCm = parseFloat(data.distance_cm);
        setFillLevel(distanceCm);

        const maxDistanceCm = 40;
        const percentage = ((maxDistanceCm - distanceCm) / maxDistanceCm) * 100;
        setFillLevelPercentage(percentage.toFixed(2));
      }
    });

    onValue(bmpRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.temperature) setTemperature(data.temperature);
        if (data.pressure) setPressure(data.pressure);
      }
    });

    onValue(gpsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
      }
    });
  }, []);

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Fill Level in cm */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Fill Level (cm)</h5>
              <p className="card-text">{fillLevel} cm</p>
            </div>
          </div>
        </div>

        {/* Fill Level in percentage */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Fill Level (%)</h5>
              <p className="card-text">{fillLevelPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Temperature</h5>
              <p className="card-text">{temperature} °C</p>
            </div>
          </div>
        </div>

        {/* Pressure */}
        <div className="col-md-4 mt-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pressure</h5>
              <p className="card-text">{pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Latitude */}
        <div className="col-md-4 mt-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Latitude</h5>
              <p className="card-text">{latitude}</p>
            </div>
          </div>
        </div>

        {/* Longitude */}
        <div className="col-md-4 mt-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Longitude</h5>
              <p className="card-text">{longitude}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorData;
