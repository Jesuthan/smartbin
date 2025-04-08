
import { SMSAlert, SMSCommand } from "@/types/alert";
import { mockBins } from "@/data/mockBins";

// Mock data for SMS alerts
export const mockAlerts: SMSAlert[] = [
  {
    id: "alert001",
    binId: "bin003",
    binName: mockBins.find(b => b.id === "bin003")?.name || "Shopping Mall Bin 3",
    message: `Bin 3 is full - 95% garbage level at ${mockBins.find(b => b.id === "bin003")?.location.latitude.toFixed(3)}°N, ${mockBins.find(b => b.id === "bin003")?.location.longitude.toFixed(3)}°E`,
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'sent'
  },
  {
    id: "alert002",
    binId: "bin002",
    binName: mockBins.find(b => b.id === "bin002")?.name || "Park Area Bin 2",
    message: `Bin 2 is half full - 75% garbage level at ${mockBins.find(b => b.id === "bin002")?.location.latitude.toFixed(3)}°N, ${mockBins.find(b => b.id === "bin002")?.location.longitude.toFixed(3)}°E`,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    status: 'sent'
  },
  {
    id: "alert003",
    binId: "bin005",
    binName: mockBins.find(b => b.id === "bin005")?.name || "School Zone Bin 5",
    message: `Bin 5 is half full - 5 cm garbage level at ${mockBins.find(b => b.id === "bin005")?.location.latitude.toFixed(3)}°N, ${mockBins.find(b => b.id === "bin005")?.location.longitude.toFixed(3)}°E`,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    status: 'sent'
  },
  {
    id: "alert004",
    binId: "bin001",
    binName: mockBins.find(b => b.id === "bin001")?.name || "City Center Bin 1",
    message: `Bin 1 status alert - 25% garbage level at ${mockBins.find(b => b.id === "bin001")?.location.latitude.toFixed(3)}°N, ${mockBins.find(b => b.id === "bin001")?.location.longitude.toFixed(3)}°E`,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 hours ago
    status: 'sent'
  },
];

// Function to get mock alerts for a specific bin
export const getBinAlerts = (binId: string): SMSAlert[] => {
  return mockAlerts.filter(alert => alert.binId === binId);
};

// Function to simulate sending a compression command to a bin
export const sendCompressCommand = (binId: string): Promise<SMSCommand> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // 80% chance of success
      if (Math.random() > 0.2) {
        const command: SMSCommand = {
          type: 'compress',
          binId,
          status: 'sent',
          sentAt: new Date().toISOString()
        };
        resolve(command);
      } else {
        const command: SMSCommand = {
          type: 'compress',
          binId,
          status: 'failed',
          sentAt: new Date().toISOString()
        };
        reject(command);
      }
    }, 1500);
  });
};
