import { makeAutoObservable, runInAction } from "mobx";
import { specialistService, Specialist, CreateSpecialistDto, UpdateSpecialistDto } from "@/services/specialist.service";

class SpecialistStore {
  specialists: Specialist[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAll() {
    this.loading = true;
    try {
      const data = await specialistService.getAll();
      runInAction(() => {
        this.specialists = data;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchByService(serviceId: number) {
    this.loading = true;
    const hostname = window.location.hostname;

    try {
      const data = await specialistService.getByService(serviceId);
      runInAction(() => {
        this.specialists = data;
      });
    } finally {
      this.loading = false;
    }
  }

  async create(dto: CreateSpecialistDto) {
    const created = await specialistService.create(dto);
    runInAction(() => {
      this.specialists.push(created);
    });
  }

  async update(id: number, dto: UpdateSpecialistDto) {
    const updated = await specialistService.update(id, dto);
    runInAction(() => {
      const idx = this.specialists.findIndex(s => s.id === id);
      if (idx !== -1) this.specialists[idx] = updated;
    });
  }

  async remove(id: number) {
    await specialistService.remove(id);
    runInAction(() => {
      this.specialists = this.specialists.filter(s => s.id !== id);
    });
  }
}

export const specialistStore = new SpecialistStore();
