
export interface SMSAlert {
  id: string;
  binId: string;
  binName: string;
  message: string;
  sentAt: string; // ISO date string
  status: 'sent' | 'failed' | 'pending';
}

export interface SMSCommand {
  type: 'compress' | 'bin status';
  binId: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string; // ISO date string
}
