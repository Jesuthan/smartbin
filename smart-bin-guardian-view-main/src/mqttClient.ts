// src/mqttClient.ts

import mqtt from "mqtt";

const MQTT_BROKER_URL = "mqtts://5bb560ad9a7d4cbb99477c530771a7f5.s1.eu.hivemq.cloud:8883";

// Replace these with your actual HiveMQ Cloud credentials
const options = {
  clientId: `smart-bin-${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,

   // ✅ Environment-secured credentials
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
};

export function connectMQTT() {
  const client = mqtt.connect(MQTT_BROKER_URL, options);

  client.on("connect", () => {
    console.log("✅ MQTT Connected");
    client.subscribe("smart/bin/status", (err) => {
      if (!err) {
        console.log("📡 Subscribed to smart/bin/status");
      } else {
        console.error("❌ Subscription error:", err.message);
      }
    });
  });

  client.on("message", (topic, message) => {
    console.log(`📨 Message on ${topic}:`, message.toString());
  });

  client.on("error", (err) => {
    console.error("❌ MQTT Error:", err.message);
    client.end();
  });

  return client;
}
