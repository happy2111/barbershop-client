import * as React from "react";

/**
 * Хук для отслеживания медиа-запросов (например, ширины экрана).
 * @param query Строка запроса, например "(min-width: 768px)"
 * @returns boolean - совпадает ли текущий размер экрана с запросом
 */
export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = window.matchMedia(query);
    result.addEventListener("change", onChange);

    // Устанавливаем начальное значение
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}