import { makeAutoObservable, runInAction } from "mobx";
import { serviceService, Service, CreateServiceDto, UpdateServiceDto } from "@/services/service.service";

class ServiceStore {
  services: Service[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAll() {
    this.loading = true;
    try {
      const data = await serviceService.getAll();
      runInAction(() => {
        this.services = data;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createService(dto: CreateServiceDto) {
    const newService = await serviceService.create(dto);
    runInAction(() => {
      this.services.push(newService);
    });
  }

  async updateService(id: number, dto: UpdateServiceDto) {
    const updated = await serviceService.update(id, dto);
    runInAction(() => {
      const index = this.services.findIndex(s => s.id === id);
      if (index !== -1) this.services[index] = updated;
    });
  }

  async removeService(id: number) {
    await serviceService.remove(id);
    runInAction(() => {
      this.services = this.services.filter(s => s.id !== id);
    });
  }


  async fetchByCategory(categoryId: number) {
    this.loading = true;
    try {
      const data = await serviceService.getByCategory(categoryId);
      runInAction(() => {
        this.services = data;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

}

export const serviceStore = new ServiceStore();
