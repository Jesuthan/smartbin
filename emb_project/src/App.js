import React, { useState, useEffect } from "react";
import { db } from "./firebase"; // Import Firebase
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Header from "./components/Header";
import SensorData from "./components/SensorData";
import Map from "./components/Map";
import ControlButtons from "./components/ControlButtons";
import { ref, onValue, query, orderByKey, limitToLast, set } from "firebase/database"; // Firebase methods for real-time data fetching
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // State to store multiple bins
  const [bins, setBins] = useState([]);
  const [gpsLocation, setGpsLocation] = useState({ lat: 0, lon: 0 });

  // Effect hook to fetch data from Firebase Realtime Database
  useEffect(() => {
    // Reference to the ultrasonic_readings node in Firebase
    const ultrasonicRef = ref(db, "ultrasonic_readings");

    // Query to get the latest key (last inserted record)
    const latestDataQuery = query(ultrasonicRef, orderByKey(), limitToLast(1));

    // Listen for changes in the latest data
    const unsubscribeUltrasonic = onValue(latestDataQuery, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched Latest Data:", data); // Debugging to see the fetched data

      if (data) {
        const latestKey = Object.keys(data)[0];
        const latestReading = data[latestKey];

        // Update fillLevel for the first bin or create a new one if necessary
        setBins((prevBins) => {
          if (prevBins.length > 0) {
            const updatedBins = [...prevBins];
            updatedBins[0].fillLevel = latestReading.distance_cm || 0; // Updating the first bin's fill level
            return updatedBins;
          } else {
            return [
              {
                id: 1,
                fillLevel: latestReading.distance_cm || 0,
                temperature: "Loading...",
                pressure: "Loading...",
                latitude: "Loading...",
                longitude: "Loading...",
              },
            ];
          }
        });
      } else {
        console.warn("No data found under ultrasonic_readings");
      }
    });

    // Reference to the sensorData/temperature node in Firebase
    const temperatureRef = ref(db, "sensorData/temperature");

    const unsubscribeTemperature = onValue(temperatureRef, (snapshot) => {
      const temp = snapshot.val();
      if (temp) {
        setBins((prevBins) => {
          if (prevBins.length > 0) {
            const updatedBins = [...prevBins];
            updatedBins[0].temperature = temp; // Update temperature for the first bin
            return updatedBins;
          }
          return prevBins;
        });
      }
    });

    // ✅ Reference and listener for GPS data
    const gpsRef = ref(db, "devices/esp32_combined_01/gps");

    const unsubscribeGPS = onValue(gpsRef, (snapshot) => {
      const gpsData = snapshot.val();
      if (gpsData && gpsData.latitude && gpsData.longitude) {
        setGpsLocation({
          lat: parseFloat(gpsData.latitude),
          lon: parseFloat(gpsData.longitude),
        });
      }
    });

    // Reference and listener for pressure data (if available in Firebase)
    const pressureRef = ref(db, "sensorData/pressure");
    const unsubscribePressure = onValue(pressureRef, (snapshot) => {
      const pressure = snapshot.val();
      if (pressure) {
        setBins((prevBins) => {
          if (prevBins.length > 0) {
            const updatedBins = [...prevBins];
            updatedBins[0].pressure = pressure; // Update pressure for the first bin
            return updatedBins;
          }
          return prevBins;
        });
      }
    });

    // Clean up listeners
    return () => {
      unsubscribeUltrasonic();
      unsubscribeTemperature();
      unsubscribeGPS();
      unsubscribePressure(); // ✅ cleanup
    };
  }, []);

  // Function to add a new bin
  const addBin = () => {
    setBins((prevBins) => [
      ...prevBins,
      { id: prevBins.length + 1, fillLevel: "Loading...", temperature: "Loading...", pressure: "Loading...", latitude: "Loading...", longitude: "Loading..." },
    ]);
  };

  // Function to trigger compress action (Send signal to Firebase)
  const onCompressWaste = () => {
    // Reference to the compress_bin node in Firebase
    const compressRef = ref(db, "compress_bin");

    // Set the value to true to trigger the compress action on the ESP32
    set(compressRef, true)
      .then(() => {
        console.log("Compress command sent to Firebase");
      })
      .catch((error) => {
        console.error("Error sending compress command: ", error);
      });
  };

  // Inline style for the background image
  const containerStyle = {
    backgroundImage: `url('/backg2.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    color: 'white',
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Smart Waste Bin</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">About Us</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid" style={containerStyle}>
        <Routes>
          <Route 
            path="/" 
            element={<SensorData bins={bins} />} 
          />
          <Route path="/about" element={<h2>About Us Page</h2>} />
          <Route path="/login" element={<h2>Login Page</h2>} />
        </Routes>

        {/* ✅ Updated GPS props passed to Map */}
        <Map latitude={gpsLocation.lat} longitude={gpsLocation.lon} />
        <ControlButtons onCompressWaste={onCompressWaste} addBin={addBin} />
      </div>
    </Router>
  );
}

export default App;
