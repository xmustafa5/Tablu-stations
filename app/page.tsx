'use client';
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Reservation, ReservationForm } from "./_components/ReservationForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReservationTable } from "./_components/ReservationTable";

export default function App() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      advertiserName: "Tech Solutions Inc",
      customerName: "John Smith",
      location: "Downtown Main St",
      startTime: "2025-10-15T09:00",
      endTime: "2025-10-22T17:00",
      status: "waiting",
    },
    {
      id: "2",
      advertiserName: "Fashion Brand Co",
      customerName: "Sarah Johnson",
      location: "Shopping Mall - North Entrance",
      startTime: "2025-10-10T08:00",
      endTime: "2025-10-13T20:00",
      status: "ending_soon",
    },
    {
      id: "3",
      advertiserName: "Local Restaurant",
      customerName: "Mike Davis",
      location: "Airport Terminal 2",
      startTime: "2025-09-20T10:00",
      endTime: "2025-10-05T18:00",
      status: "completed",
    },
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSaveReservation = (reservation: Omit<Reservation, "id">) => {
    if (editingReservation) {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === editingReservation.id ? { ...reservation, id: r.id } : r
        )
      );
      setEditingReservation(undefined);
    } else {
      const newReservation: Reservation = {
        ...reservation,
        id: Date.now().toString(),
      };
      setReservations((prev) => [...prev, newReservation]);
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsFormOpen(true);
  };

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingReservation(undefined);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesSearch =
        reservation.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Advertising Board Reservations</h1>
          <p className="text-muted-foreground">
            Manage your advertising board display reservations and track their status
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by advertiser, customer, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ending_soon">Ending Soon</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Reservation
          </Button>
        </div>

        <ReservationTable
          reservations={filteredReservations}
          onEdit={handleEditReservation}
          onDelete={handleDeleteReservation}
        />

        <ReservationForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          onSave={handleSaveReservation}
          editReservation={editingReservation}
        />
      </div>
    </div>
  );
}
