
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockBins } from "@/data/mockBins";
import { mockAlerts } from "@/data/mockAlerts";
import BinCard from "@/components/BinCard";
import BinMap from "@/components/BinMap";
import SMSAlertsLog from "@/components/SMSAlertsLog";
import { useToast } from "@/hooks/use-toast";
import { Table, MapPin, Plus, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddBinForm from "@/components/AddBinForm";
import { Bin } from "@/types/bin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"list" | "map">("list");
  const [bins, setBins] = useState<Bin[]>(mockBins);
  const [addBinDialogOpen, setAddBinDialogOpen] = useState(false);
  
  const handleBinClick = (binId: string) => {
    navigate(`/bin/${binId}`);
  };

  const handleAddBin = (binData: Omit<Bin, "id" | "garbageLevel" | "temperature" | "pressure" | "status" | "lastUpdated">) => {
    const newBin: Bin = {
      id: `bin-${Date.now()}`, // Generate a unique ID
      name: binData.name,
      location: binData.location,
      installationDate: binData.installationDate || new Date().toISOString(),
      zone: binData.zone || "",
      notes: binData.notes || "",
      garbageLevel: {
        value: 0,
        unit: "percentage",
      },
      temperature: 20, // Default temperature
      pressure: 1013, // Default pressure (standard atmospheric pressure)
      status: "empty",
      lastUpdated: new Date().toISOString(),
    };
    
    setBins([...bins, newBin]);
    setAddBinDialogOpen(false);
    
    toast({
      title: "Bin Added",
      description: `New bin "${binData.name}" has been added successfully`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Smart Bin Dashboard</h1>
        <div className="flex gap-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`p-2 rounded-md ${
                viewType === "list" ? "bg-white shadow" : ""
              }`}
              onClick={() => setViewType("list")}
            >
              <Table className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded-md ${
                viewType === "map" ? "bg-white shadow" : ""
              }`}
              onClick={() => setViewType("map")}
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
          <button
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
            onClick={() => setAddBinDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span>Add Bin</span>
          </button>
        </div>
      </div>

      <Tabs defaultValue="bins" className="mb-8">
        <TabsList>
          <TabsTrigger value="bins">Bins</TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bins">
          {viewType === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bins.map((bin) => (
                <BinCard
                  key={bin.id}
                  bin={bin}
                  onClick={() => handleBinClick(bin.id)}
                />
              ))}
            </div>
          ) : (
            <BinMap bins={bins} />
          )}
        </TabsContent>
        <TabsContent value="alerts">
          <SMSAlertsLog alerts={mockAlerts} />
        </TabsContent>
      </Tabs>

      <Dialog open={addBinDialogOpen} onOpenChange={setAddBinDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Bin</DialogTitle>
            <DialogDescription>
              Enter the details to add a new garbage bin to the system.
            </DialogDescription>
          </DialogHeader>
          <AddBinForm
            onSubmit={handleAddBin}
            onCancel={() => setAddBinDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
