import { makeAutoObservable, runInAction } from "mobx";
import { serviceStore } from "./service.store";
import { specialistStore } from "./specialist.store";
import { clientService } from "@/services/client.service";
import { bookingService } from "@/services/booking.service";

export class BookingFlowStore {
  selectedServiceId: number | null = null;
  selectedSpecialistId: number | null = null;
  selectedDate: string | null = null;

  freeSlots: { start: string; end: string }[] = [];

  selectedSlot: { start: string; end: string } | null = null;

  clientName = "";
  clientPhone = "";

  constructor() {
    makeAutoObservable(this);
  }

  selectService(id: number) {
    this.selectedServiceId = id;
    specialistStore.fetchByService(id);
  }

  selectSpecialist(id: number) {
    this.selectedSpecialistId = id;
  }

  setDate(date: string) {
    this.selectedDate = date;

    if (this.selectedSpecialistId && this.selectedServiceId) {
      this.loadFreeSlots();
    }
  }

  async loadFreeSlots() {
    if (!this.selectedSpecialistId || !this.selectedServiceId || !this.selectedDate) return;

    const slots = await bookingService.getFreeSlots(
      this.selectedSpecialistId,
      this.selectedServiceId,
      this.selectedDate
    );

    runInAction(() => {
      this.freeSlots = slots;
    });
  }

  selectSlot(slot: { start: string; end: string }) {
    this.selectedSlot = slot;
  }

  setClientData(name: string, phone: string) {
    this.clientName = name;
    this.clientPhone = phone;
  }

  async createBooking() {
    if (!this.selectedSlot) throw new Error("Time slot required");

    const client = await clientService.create({
      name: this.clientName,
      phone: this.clientPhone,
    });

    const booking = await bookingService.create({
      clientId: client.id,
      specialistId: this.selectedSpecialistId!,
      serviceId: this.selectedServiceId!,
      date: this.selectedDate!,
      start_time: this.selectedSlot.start,
      end_time: this.selectedSlot.end,
      status: undefined,
    });

    return booking;
  }
}

export const bookingFlowStore = new BookingFlowStore();
