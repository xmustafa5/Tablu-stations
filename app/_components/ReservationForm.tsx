import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ReservationStatus = "waiting" | "active" | "ending_soon" | "completed" | "expired";

export interface Reservation {
  id: string;
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reservation: Omit<Reservation, "id">) => void;
  editReservation?: Reservation;
}

export function ReservationForm({ open, onOpenChange, onSave, editReservation }: ReservationFormProps) {
  const [advertiserName, setAdvertiserName] = useState(editReservation?.advertiserName || "");
  const [customerName, setCustomerName] = useState(editReservation?.customerName || "");
  const [location, setLocation] = useState(editReservation?.location || "");
  const [startTime, setStartTime] = useState(editReservation?.startTime || "");
  const [endTime, setEndTime] = useState(editReservation?.endTime || "");
  const [status, setStatus] = useState<ReservationStatus>(editReservation?.status || "waiting");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      advertiserName,
      customerName,
      location,
      startTime,
      endTime,
      status,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setAdvertiserName("");
    setCustomerName("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setStatus("waiting");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editReservation ? "Edit Reservation" : "New Reservation"}</DialogTitle>
          <DialogDescription>
            {editReservation ? "Edit the advertising board reservation details." : "Add a new advertising board reservation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="advertiser">Advertiser Name</Label>
              <Input
                id="advertiser"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="Enter advertiser name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Board Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Downtown Main St, Airport Terminal 2"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Display Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Display End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ReservationStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ending_soon">Ending Soon</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editReservation ? "Update" : "Add"} Reservation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
