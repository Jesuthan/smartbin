
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, ThermometerIcon, Gauge, MapPin, Trash2, Bell, PackageCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockBins } from "@/data/mockBins";
import { getBinAlerts, sendCompressCommand } from "@/data/mockAlerts";
import { Bin } from "@/types/bin";
import { SMSAlert } from "@/types/alert";
import { format } from "date-fns";
import SMSAlertsLog from "@/components/SMSAlertsLog";
import ManualCommandForm from "@/components/ManualCommandForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BinDetails = () => {
  const { binId } = useParams<{ binId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bin, setBin] = useState<Bin | null>(null);
  const [alerts, setAlerts] = useState<SMSAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    // Find the bin from mock data
    const foundBin = mockBins.find((b) => b.id === binId);
    if (foundBin) {
      setBin(foundBin);
      
      // Get alerts for this bin
      if (binId) {
        const binAlerts = getBinAlerts(binId);
        setAlerts(binAlerts);
      }
    }
  }, [binId]);

  const handleRefresh = () => {
    setLoading(true);
    
    // Simulate a refresh with a slight delay
    setTimeout(() => {
      // Create an updated bin with new random values
      if (bin) {
        const updatedBin: Bin = {
          ...bin,
          garbageLevel: {
            value: Math.min(Math.max(bin.garbageLevel.value + (Math.random() * 20 - 10), 0), 100),
            unit: bin.garbageLevel.unit
          },
          temperature: Math.round((bin.temperature + (Math.random() * 2 - 1)) * 10) / 10,
          pressure: Math.round((bin.pressure + (Math.random() * 5 - 2.5)) * 10) / 10,
          lastUpdated: new Date().toISOString()
        };
        
        // Update status based on garbage level
        if (updatedBin.garbageLevel.unit === 'percentage') {
          if (updatedBin.garbageLevel.value < 30) updatedBin.status = 'empty';
          else if (updatedBin.garbageLevel.value < 75) updatedBin.status = 'half';
          else updatedBin.status = 'full';
        }
        
        setBin(updatedBin);
        
        toast({
          title: "Readings Updated",
          description: "Latest sensor readings have been fetched",
        });
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleCompress = () => {
    if (!binId) return;
    
    setCompressing(true);
    sendCompressCommand(binId)
      .then(() => {
        toast({
          title: "Compression Command Sent",
          description: `Sent "compress" command to ${bin?.name}`,
        });
      })
      .catch(() => {
        toast({
          title: "Command Failed",
          description: "Unable to send compression command. Please try again.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setCompressing(false);
      });
  };

  const getStatusColor = (status: Bin["status"]) => {
    switch (status) {
      case "empty":
        return "bg-green-500";
      case "half":
        return "bg-yellow-500";
      case "full":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Bin["status"]) => {
    switch (status) {
      case "empty":
        return "Empty";
      case "half":
        return "Half Full";
      case "full":
        return "Full";
      default:
        return "Unknown";
    }
  };

  if (!bin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-center py-8">Bin not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format last updated time
  const formattedTime = format(new Date(bin.lastUpdated), "MMM d, yyyy h:mm a");

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Bin Details</TabsTrigger>
          <TabsTrigger value="commands">Manual Commands</TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            SMS Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{bin.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <div className="flex items-center gap-1">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(bin.status)}`} />
                      <span className="text-sm">{getStatusText(bin.status)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          %
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Garbage Level</p>
                        <p className="text-lg font-medium">{Math.round(bin.garbageLevel.value)}%</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(bin.status)}`}>
                      {getStatusText(bin.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <ThermometerIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Temperature</p>
                          <p className="text-lg font-medium">{bin.temperature}°C</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Gauge className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pressure</p>
                          <p className="text-lg font-medium">{bin.pressure} hPa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <MapPin className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-base font-medium">
                          {bin.location.latitude.toFixed(6)}, {bin.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map view will be implemented in the next phase</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleCompress} 
                      disabled={compressing || bin.status === 'empty'}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      <PackageCheck className={`h-4 w-4 ${compressing ? "animate-spin" : ""}`} />
                      {compressing ? "Sending..." : "Compress Bin"}
                    </Button>
                    
                    <Button 
                      onClick={handleRefresh} 
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Updating..." : "Refresh Data"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4 flex flex-col items-start gap-2">
                <div className="w-full flex justify-between items-center">
                  <p className="text-sm text-gray-500">Last updated: {formattedTime}</p>
                  <div className="text-xs text-gray-400 italic">
                    <div className="flex items-center gap-1">
                      <PackageCheck className="h-3 w-3" />
                      <span>Compression is a future feature - press to simulate</span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bin Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bin ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{bin.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Installation Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {bin.installationDate ? format(new Date(bin.installationDate), "MMMM d, yyyy") : "Not available"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Zone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{bin.zone || "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {bin.notes || "No notes available"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historical Data</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-md">
                  <p className="text-gray-500">Historical data will be implemented in the next phase</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="commands">
          <div className="mb-6 max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Send Manual Command</CardTitle>
              </CardHeader>
              <CardContent>
                <ManualCommandForm 
                  binId={bin.id} 
                  binName={bin.name}
                  onCommandSent={(command) => {
                    // If we get more command types in the future, we could handle them differently here
                    if (command.type === 'compress') {
                      // Simulate a compression
                      setTimeout(() => {
                        // Update bin status if it was compressed
                        if (bin.status !== 'empty' && command.status === 'sent') {
                          const updatedBin = {
                            ...bin,
                            garbageLevel: {
                              ...bin.garbageLevel,
                              value: Math.max(bin.garbageLevel.value * 0.6, 5) // Reduce by 40% but never below 5%
                            },
                            lastUpdated: new Date().toISOString()
                          };
                          
                          // Update status based on new garbage level
                          if (updatedBin.garbageLevel.value < 30) updatedBin.status = 'empty';
                          else if (updatedBin.garbageLevel.value < 75) updatedBin.status = 'half';
                          
                          setBin(updatedBin);
                          
                          toast({
                            title: "Bin Compressed",
                            description: "Garbage level reduced due to compression",
                          });
                        }
                      }, 3000);
                    } else if (command.type === 'bin status') {
                      // Simulate a status refresh
                      handleRefresh();
                    }
                  }}
                />
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">How it works:</span> These commands are sent via SMS to the bin's SIM card. 
                    The "bin status" command requests real-time sensor data, while "compress" activates the bin's internal compaction mechanism.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>SMS Alerts for {bin.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <SMSAlertsLog alerts={alerts} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No SMS alerts have been sent for this bin yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BinDetails;
