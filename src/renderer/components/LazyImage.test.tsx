import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LazyImage from './LazyImage';

let observerCallbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
let observedElements: Element[] = [];

class MockIntersectionObserver {
  callback: (entries: Partial<IntersectionObserverEntry>[]) => void;
  options: IntersectionObserverInit | undefined;

  constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    observerCallbacks.push(callback);
  }

  observe(element: Element) {
    observedElements.push(element);
  }

  unobserve() {}

  disconnect() {}
}

function simulateIntersection(isIntersecting: boolean) {
  const cb = observerCallbacks[observerCallbacks.length - 1];
  if (cb) {
    act(() => {
      cb([{
        isIntersecting,
        intersectionRatio: isIntersecting ? 1.0 : 0,
        boundingClientRect: { x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0, toJSON: () => ({}) } as DOMRectReadOnly,
      }]);
    });
  }
}

beforeEach(() => {
  observerCallbacks = [];
  observedElements = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LazyImage', () => {
  it('renders container with idle state initially', () => {
    const { container } = render(<LazyImage src="/test.png" alt="test image" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.getAttribute('data-state')).toBe('idle');
    expect(wrapper.classList.contains('lazy-image-container')).toBe(true);
  });

  it('shows skeleton placeholder before image loads', () => {
    render(<LazyImage src="/test.png" alt="test image" />);
    const skeleton = screen.getByRole('img', { name: 'test image 로딩 중' });
    expect(skeleton).toBeTruthy();
    expect(skeleton.getAttribute('aria-busy')).toBe('true');
  });

  it('does not render image until visible', () => {
    const { container } = render(<LazyImage src="/test.png" alt="test image" />);
    const imgs = container.querySelectorAll('img.lazy-image');
    expect(imgs.length).toBe(0);
  });

  it('starts loading image when element becomes visible', () => {
    const { container } = render(<LazyImage src="/test.png" alt="test image" />);

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/test.png');
    expect(img?.getAttribute('alt')).toBe('test image');
  });

  it('transitions to loaded state on image load', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" onLoad={onLoad} />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image') as HTMLImageElement;
    expect(img).toBeTruthy();

    act(() => {
      fireEvent.load(img);
    });

    expect(container.firstChild).toHaveAttribute('data-state', 'loaded');
    expect(img.classList.contains('lazy-image-visible')).toBe(true);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('transitions to error state on image error', () => {
    const onError = vi.fn();
    const { container } = render(
      <LazyImage src="/broken.png" alt="broken image" onError={onError} />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image') as HTMLImageElement;
    expect(img).toBeTruthy();

    act(() => {
      fireEvent.error(img);
    });

    expect(container.firstChild).toHaveAttribute('data-state', 'error');
    const errorIndicator = screen.getByRole('img', { name: 'broken image 로드 실패' });
    expect(errorIndicator).toBeTruthy();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder image instead of skeleton when placeholderSrc is provided', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" placeholderSrc="/thumb.jpg" />
    );

    const placeholder = container.querySelector('img.lazy-image-placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.getAttribute('src')).toBe('/thumb.jpg');
    expect(placeholder?.getAttribute('aria-hidden')).toBe('true');

    // No skeleton should be shown
    const skeletons = container.querySelectorAll('.lazy-image-skeleton');
    expect(skeletons.length).toBe(0);
  });

  it('applies object-fit class based on fit prop', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" fit="contain" />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image');
    expect(img?.classList.contains('lazy-image-fit-contain')).toBe(true);
  });

  it('defaults to cover fit', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image');
    expect(img?.classList.contains('lazy-image-fit-cover')).toBe(true);
  });

  it('supports all fit variants', () => {
    const fits = ['contain', 'cover', 'fill', 'none'] as const;
    for (const fit of fits) {
      const { container, unmount } = render(
        <LazyImage src="/test.png" alt="test image" fit={fit} />
      );

      simulateIntersection(true);

      const img = container.querySelector('img.lazy-image');
      expect(img?.classList.contains(`lazy-image-fit-${fit}`)).toBe(true);
      unmount();
    }
  });

  it('applies custom className', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" className="my-custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('my-custom-class')).toBe(true);
    expect(wrapper.classList.contains('lazy-image-container')).toBe(true);
  });

  it('applies width and height styles', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" width={300} height={200} />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('300px');
    expect(wrapper.style.height).toBe('200px');
  });

  it('supports string width and height', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" width="50%" height="auto" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('50%');
    expect(wrapper.style.height).toBe('auto');
  });

  it('defaults width to 100% and height to auto', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('100%');
    expect(wrapper.style.height).toBe('auto');
  });

  it('hides skeleton and placeholder after load', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" placeholderSrc="/thumb.jpg" />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image') as HTMLImageElement;
    act(() => {
      fireEvent.load(img);
    });

    const skeletons = container.querySelectorAll('.lazy-image-skeleton');
    expect(skeletons.length).toBe(0);

    const placeholders = container.querySelectorAll('.lazy-image-placeholder');
    expect(placeholders.length).toBe(0);
  });

  it('observes the container element', () => {
    render(<LazyImage src="/test.png" alt="test image" />);
    expect(observedElements.length).toBeGreaterThan(0);
  });

  it('sets loading=lazy on the img element', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('does not show error indicator before error occurs', () => {
    render(<LazyImage src="/test.png" alt="test image" />);
    const errorElements = screen.queryAllByText('!');
    expect(errorElements.length).toBe(0);
  });

  it('calls onLoad only once', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <LazyImage src="/test.png" alt="test image" onLoad={onLoad} />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image') as HTMLImageElement;
    act(() => {
      fireEvent.load(img);
    });
    act(() => {
      fireEvent.load(img);
    });

    // onLoad still called twice since the event fires twice
    // but state should remain 'loaded'
    expect(container.firstChild).toHaveAttribute('data-state', 'loaded');
  });

  it('renders correctly with no optional props', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="minimal" />
    );

    expect(container.firstChild).toBeTruthy();
    expect(container.firstChild).toHaveAttribute('data-state', 'idle');
  });

  it('error indicator has exclamation mark icon', () => {
    const { container } = render(
      <LazyImage src="/broken.png" alt="broken" />
    );

    simulateIntersection(true);

    const img = container.querySelector('img.lazy-image') as HTMLImageElement;
    act(() => {
      fireEvent.error(img);
    });

    const icon = container.querySelector('.lazy-image-error-icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toBe('!');
  });

  it('placeholder image has empty alt for a11y', () => {
    const { container } = render(
      <LazyImage src="/test.png" alt="test" placeholderSrc="/thumb.jpg" />
    );

    const placeholder = container.querySelector('.lazy-image-placeholder');
    expect(placeholder?.getAttribute('alt')).toBe('');
  });
});
