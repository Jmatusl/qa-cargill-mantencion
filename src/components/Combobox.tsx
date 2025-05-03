"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
  options: { value: string; label: string; disabled?: boolean }[]; // Array de opciones pasadas por props
  value?: string; // Valor inicial opcional
  onValueChange?: (value: string) => void; // Callback para enviar el valor seleccionado al componente padre
  placeholder?: string; // Texto de placeholder opcional
  disabled?: boolean; // Prop para deshabilitar el combobox
}

export function Combobox({
  options,
  value: initialValue = "",
  placeholder,
  onValueChange,
  disabled = false, // Por defecto no está deshabilitado
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>();

  // Actualizar el valor cuando cambie el valor inicial desde el padre
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Manejar selección de valor
  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    setOpen(false);

    if (onValueChange) {
      onValueChange(newValue); // Notificar al componente padre
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[200px] w-full justify-between"
          disabled={disabled} // Deshabilitar el botón si `disabled` es true
        >
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {value
              ? options.find((option) => option.value === value)?.label
              : disabled
              ? placeholder || "No hay opciones"
              : "Seleccione..."}
          </div>
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[200px] w-full p-0">
        <Command>
          <CommandInput
            placeholder="Buscar opción..."
            className="h-9"
            disabled={disabled || options.length === 0} // Deshabilitar input si no hay opciones o está deshabilitado
          />
          <CommandList>
            {disabled || options.length === 0 ? (
              <CommandEmpty>No hay opciones.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    disabled={option.disabled || disabled} // Opción deshabilitada si `disabled` es true
                  >
                    {option.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
