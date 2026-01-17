import * as React from "react";
import { Check, ChevronsUpDown, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Specialist {
  id: number;
  name: string;
  photo?: string;
}

interface SpecialistSelectorProps {
  specialists: any[];
  selectedSpecialist: any | null;
  setSelectedSpecialist: (spec: any) => void;
  t: any;
  disabled?: boolean;
}

export function SpecialistSelector({
                                     specialists,
                                     selectedSpecialist,
                                     setSelectedSpecialist,
                                     t,
                                     disabled = false,
                                   }: SpecialistSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filteredSpecialists = specialists.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ListContent = (
    <div className="flex flex-col h-full bg-popover">
      <div className="flex items-center px-3 border-b sticky top-0 bg-popover z-10">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          placeholder={t("placeholders.search_specialist")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto max-h-[300px] md:max-h-64 p-1 space-y-1">
        {filteredSpecialists.length > 0 ? (
          <div className="p-1">
            {filteredSpecialists.map((spec) => (
              <button
                key={spec.id}
                onClick={() => {
                  setSelectedSpecialist(spec);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors mb-1",
                  selectedSpecialist?.id === spec.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent hover:text-accent-foreground text-left"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={spec.photo} alt={spec.name} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <span>{spec.name}</span>
                </div>
                {selectedSpecialist?.id === spec.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("search.no_results")}
          </div>
        )}
      </div>
    </div>
  );

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      disabled={disabled}
      className="w-full justify-between h-auto py-2 px-3 text-left font-normal"
    >
      <div className="flex items-center gap-2">
        {selectedSpecialist ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarImage src={selectedSpecialist.photo} />
              <AvatarFallback><User className="h-3.5 w-3.5" /></AvatarFallback>
            </Avatar>
            <span className="truncate">{selectedSpecialist.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">{t("placeholders.select_specialist")}</span>
        )}
      </div>
      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
          {ListContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 pb-10 px-2">{ListContent}</div>
      </DrawerContent>
    </Drawer>
  );
}