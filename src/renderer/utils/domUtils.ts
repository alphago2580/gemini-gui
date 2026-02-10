/**
 * DOM utility functions for common operations.
 */

/** Check if an element is visible in the viewport */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

/** Check if an element is fully within the viewport */
export function isElementFullyVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/** Get the scroll percentage of an element (0-100) */
export function getScrollPercent(element: HTMLElement): number {
  const { scrollTop, scrollHeight, clientHeight } = element;
  if (scrollHeight <= clientHeight) return 100;
  return Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
}

/** Check if element is scrolled near the bottom (within threshold pixels) */
export function isNearBottom(element: HTMLElement, threshold = 100): boolean {
  const { scrollTop, scrollHeight, clientHeight } = element;
  return scrollHeight - scrollTop - clientHeight <= threshold;
}

/** Get computed CSS property value of an element */
export function getComputedStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

/** Get all focusable elements within a container */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selectors));
}

/** Trap focus within a container (for modals/dialogs) */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/** Scroll element into view with optional smooth behavior */
export function scrollIntoViewIfNeeded(
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (!isElementVisible(element)) {
    element.scrollIntoView({ behavior, block: 'nearest' });
  }
}

/** Copy text to clipboard, returns success status */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Get data attribute value from an element */
export function getDataAttribute(element: HTMLElement, name: string): string | null {
  return element.getAttribute(`data-${name}`);
}

/** Set data attribute on an element */
export function setDataAttribute(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(`data-${name}`, value);
}

/** Check if element matches a CSS selector */
export function matchesSelector(element: HTMLElement, selector: string): boolean {
  return element.matches(selector);
}

/** Find closest ancestor matching a selector */
export function closestAncestor(element: HTMLElement, selector: string): HTMLElement | null {
  return element.closest(selector);
}
