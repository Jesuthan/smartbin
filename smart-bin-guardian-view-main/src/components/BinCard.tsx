import React from "react";
import { Bin } from "@/types/bin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Gauge, MapPin, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { getBinStatusColor } from "@/data/mockBins";

interface BinCardProps {
  bin: Bin;
  onClick: () => void;
}

const BinCard: React.FC<BinCardProps> = ({ bin, onClick }) => {
  const { name, garbageLevel, temperature, pressure, status, lastUpdated, zone } = bin;

  // Format last updated time
  const formattedTime = format(new Date(lastUpdated), "MMM d, yyyy h:mm a");

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all relative overflow-hidden" 
      onClick={onClick}
    >
      {/* Status indicator stripe at top of card */}
      <div className={`h-1 w-full absolute top-0 left-0 ${getBinStatusColor(status)}`} />
      
      <CardHeader className="pb-2 pt-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            <div className={`h-3 w-3 rounded-full ${getBinStatusColor(status)}`} />
          </div>
        </div>
        {zone && <p className="text-sm text-gray-500 mt-1">Zone: {zone}</p>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                %
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Garbage Level</p>
              <p className="font-medium">{garbageLevel.value} {garbageLevel.unit}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <Thermometer className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="font-medium">{temperature}°C</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <Gauge className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pressure</p>
              <p className="font-medium">{pressure} hPa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium truncate w-24">GPS Coordinates</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Last updated: {formattedTime}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BinCard;
