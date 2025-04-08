
import React from "react";
import { SMSAlert } from "@/types/alert";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, AlertTriangle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SMSAlertsLogProps {
  alerts: SMSAlert[];
}

const SMSAlertsLog: React.FC<SMSAlertsLogProps> = ({ alerts }) => {
  // Sort alerts by sentAt in descending order (newest first)
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );

  const getStatusIcon = (status: SMSAlert["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">SMS Alerts Log</CardTitle>
            <CardDescription>Recent notifications sent from bins</CardDescription>
          </div>
          <div className="bg-primary/10 text-primary p-2 rounded-full">
            <Bell className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No SMS alerts have been sent yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bin</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.binName}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(alert.sentAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(alert.status)}
                      <span className="text-xs capitalize">{alert.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSAlertsLog;
