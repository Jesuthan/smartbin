
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SMSCommand } from "@/types/alert";
import { PackageCheck, Send } from "lucide-react";

interface ManualCommandFormProps {
  binId: string;
  binName: string;
  onCommandSent?: (command: SMSCommand) => void;
}

const ManualCommandForm: React.FC<ManualCommandFormProps> = ({ 
  binId, 
  binName,
  onCommandSent 
}) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<'compress' | 'bin status'>('bin status');

  const sendCommand = async () => {
    setSending(true);

    try {
      // Simulate sending command with network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 80% chance of success
      if (Math.random() > 0.2) {
        const command: SMSCommand = {
          type: selectedCommand,
          binId,
          status: 'sent',
          sentAt: new Date().toISOString()
        };
        
        toast({
          title: "Command Sent",
          description: `Sent "${selectedCommand}" command to ${binName}`,
        });
        
        if (onCommandSent) {
          onCommandSent(command);
        }
      } else {
        toast({
          title: "Command Failed",
          description: "Unable to send command. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Command Failed",
        description: "An error occurred while sending the command.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <p className="text-sm font-medium">Send Command:</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={selectedCommand === 'bin status' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedCommand('bin status')}
          >
            <Send className="h-4 w-4 mr-2" />
            bin status
          </Button>
          <Button
            type="button"
            variant={selectedCommand === 'compress' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedCommand('compress')}
          >
            <PackageCheck className="h-4 w-4 mr-2" />
            compress
          </Button>
        </div>
      </div>
      
      <Button
        className="w-full"
        onClick={sendCommand}
        disabled={sending}
      >
        {sending ? "Sending..." : "Send Command"}
      </Button>
    </div>
  );
};

export default ManualCommandForm;
