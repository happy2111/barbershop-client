import * as React from "react";
import { Check, ChevronsUpDown, Scissors, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {Service} from "@/services/service.service";
import {DialogTitle} from "@/components/ui/dialog";



interface ServiceSelectorProps {
  services: Service[];
  selectedServices: Service[];
  toggleService: (service: Service) => void;
  t: any;
}

export function ServiceSelector({
                                  services,
                                  selectedServices,
                                  toggleService,
                                  t,
                                }: ServiceSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Фильтрация услуг локально
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ListContent = (
    <div className="flex flex-col h-full bg-popover text-popover-foreground">
      {/* Поиск */}
      <div className="flex items-center px-3 border-b sticky top-0 bg-popover z-10">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          placeholder={t("placeholders.search_service")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Список услуг */}
      <div className="overflow-y-auto max-h-[350px] md:max-h-80 p-1 space-y-1 overscroll-contain">
        {filteredServices.length > 0 ? (
          <div className="p-1">
            {filteredServices.map((service) => {
              const isSelected = selectedServices.some((x) => x.id === service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-3 text-sm rounded-md transition-colors mb-1",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground text-left"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{service.name}</span>
                      <span className="text-xs opacity-70">
                        {service.duration_min} {t("common.minutes")} • {service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t("search.no_results")}
          </div>
        )}
      </div>

      {/* Кнопка "Готово" для мобилок */}
      {!isDesktop && (
        <div className="p-4 border-t mt-auto">
          <Button className="w-full" onClick={() => setOpen(false)}>
            {t("buttons.done")} ({selectedServices.length})
          </Button>
        </div>
      )}
    </div>
  );

  const TriggerButton = (
    <div className="space-y-2 w-full">
      <Button
        variant="outline"
        className="w-full justify-between h-auto py-2.5 px-3 text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Scissors className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">
            {selectedServices.length > 0
              ? selectedServices.length === 1
                ? `${selectedServices[0].name}`
                : `${t("common.services_selected")}: ${selectedServices.length}`
              : t("placeholders.select_service")}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
      </Button>

      {/* Список выбранных услуг под кнопкой */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedServices.map(s => (
            <span
              key={s.id}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground border"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="p-0 w-[400px]" align="start">
          {ListContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DialogTitle className="hidden"/>

        <div className="mx-auto w-full max-w-lg mt-4">
          {ListContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}