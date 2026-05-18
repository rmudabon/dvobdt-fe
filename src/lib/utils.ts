import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DebouncedFunction<T extends (...args: never[]) => void> = ((...args: Parameters<T>) => void) & {
    cancel: () => void
}

export const debounce = <T extends (...args: never[]) => void>(callback: T, delay: number): DebouncedFunction<T> => {
    let timeoutId: number | undefined

    const debounced = ((...args: Parameters<T>) => {
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId)
        }

        timeoutId = window.setTimeout(() => {
            callback(...args)
        }, delay)
    }) as DebouncedFunction<T>

    debounced.cancel = () => {
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId)
        }
    }

    return debounced
}