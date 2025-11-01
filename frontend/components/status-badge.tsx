import { Badge } from '@/components/ui/badge';
import { ReservationStatus } from '@/lib/types/api.types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case ReservationStatus.WAITING:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case ReservationStatus.ACTIVE:
        return 'bg-green-500 hover:bg-green-600 text-white';
      case ReservationStatus.ENDING_SOON:
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case ReservationStatus.COMPLETED:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case ReservationStatus.WAITING:
        return 'Waiting';
      case ReservationStatus.ACTIVE:
        return 'Active';
      case ReservationStatus.ENDING_SOON:
        return 'Ending Soon';
      case ReservationStatus.COMPLETED:
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <Badge className={cn(getStatusColor(), className)}>
      {getStatusLabel()}
    </Badge>
  );
}
