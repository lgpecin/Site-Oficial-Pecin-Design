/**
 * Performance optimization utilities
 * Helps avoid forced reflows and improve Core Web Vitals
 */

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call using requestAnimationFrame
 */
export function throttleRAF<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let ticking = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!ticking) {
      rafId = window.requestAnimationFrame(() => {
        func(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Batches DOM reads to avoid layout thrashing
 */
export class DOMReadBatcher {
  private readQueue: Array<() => void> = [];
  private rafId: number | null = null;

  scheduleRead(callback: () => void) {
    this.readQueue.push(callback);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush() {
    // Execute all reads in one batch
    const reads = [...this.readQueue];
    this.readQueue = [];
    this.rafId = null;

    reads.forEach(read => read());
  }

  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.readQueue = [];
  }
}

/**
 * Creates an optimized scroll listener
 */
export function createOptimizedScrollListener(
  callback: () => void,
  options?: { passive?: boolean }
): { attach: () => void; detach: () => void } {
  let rafId: number | null = null;
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      rafId = window.requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };

  return {
    attach: () => {
      window.addEventListener('scroll', handleScroll, { 
        passive: options?.passive ?? true 
      });
    },
    detach: () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    }
  };
}
