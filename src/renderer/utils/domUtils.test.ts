import {
  isElementVisible,
  isElementFullyVisible,
  getScrollPercent,
  isNearBottom,
  getComputedStyle,
  getFocusableElements,
  trapFocus,
  scrollIntoViewIfNeeded,
  copyToClipboard,
  getDataAttribute,
  setDataAttribute,
  matchesSelector,
  closestAncestor,
} from './domUtils';

describe('domUtils', () => {
  describe('isElementVisible', () => {
    it('returns true when element is in viewport', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 100, bottom: 200, left: 50, right: 150,
        width: 100, height: 100, x: 50, y: 100, toJSON: () => {},
      });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });

      expect(isElementVisible(el)).toBe(true);
    });

    it('returns false when element is above viewport', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: -200, bottom: -100, left: 50, right: 150,
        width: 100, height: 100, x: 50, y: -200, toJSON: () => {},
      });
      expect(isElementVisible(el)).toBe(false);
    });

    it('returns false when element is below viewport', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 900, bottom: 1000, left: 50, right: 150,
        width: 100, height: 100, x: 50, y: 900, toJSON: () => {},
      });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      expect(isElementVisible(el)).toBe(false);
    });
  });

  describe('isElementFullyVisible', () => {
    it('returns true when element is fully inside viewport', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 10, bottom: 100, left: 10, right: 100,
        width: 90, height: 90, x: 10, y: 10, toJSON: () => {},
      });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      expect(isElementFullyVisible(el)).toBe(true);
    });

    it('returns false when element is partially outside', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: -10, bottom: 100, left: 10, right: 100,
        width: 90, height: 110, x: 10, y: -10, toJSON: () => {},
      });
      expect(isElementFullyVisible(el)).toBe(false);
    });
  });

  describe('getScrollPercent', () => {
    it('returns 100 when content fits in container', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 0 });
      Object.defineProperty(el, 'scrollHeight', { value: 200 });
      Object.defineProperty(el, 'clientHeight', { value: 200 });
      expect(getScrollPercent(el)).toBe(100);
    });

    it('returns 0 when scrolled to top', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 0 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(getScrollPercent(el)).toBe(0);
    });

    it('returns 100 when scrolled to bottom', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 500 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(getScrollPercent(el)).toBe(100);
    });

    it('returns 50 when scrolled to middle', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 250 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(getScrollPercent(el)).toBe(50);
    });
  });

  describe('isNearBottom', () => {
    it('returns true when near bottom within threshold', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 450 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(isNearBottom(el, 100)).toBe(true);
    });

    it('returns false when far from bottom', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 100 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(isNearBottom(el, 100)).toBe(false);
    });

    it('uses default threshold of 100', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 410 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(isNearBottom(el)).toBe(true);
    });
  });

  describe('getComputedStyle', () => {
    it('returns computed CSS property value', () => {
      const el = document.createElement('div');
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: (prop: string) => prop === 'color' ? 'rgb(0, 0, 0)' : '',
      } as CSSStyleDeclaration);
      expect(getComputedStyle(el, 'color')).toBe('rgb(0, 0, 0)');
    });
  });

  describe('getFocusableElements', () => {
    it('returns focusable elements within container', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      const input = document.createElement('input');
      const link = document.createElement('a');
      link.setAttribute('href', '#');
      const span = document.createElement('span');

      container.appendChild(button);
      container.appendChild(input);
      container.appendChild(link);
      container.appendChild(span);

      const focusable = getFocusableElements(container);
      expect(focusable).toContain(button);
      expect(focusable).toContain(input);
      expect(focusable).toContain(link);
      expect(focusable).not.toContain(span);
    });

    it('excludes disabled elements', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      button.disabled = true;
      const input = document.createElement('input');
      input.disabled = true;
      container.appendChild(button);
      container.appendChild(input);

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(0);
    });

    it('includes elements with tabindex', () => {
      const container = document.createElement('div');
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      container.appendChild(div);

      const focusable = getFocusableElements(container);
      expect(focusable).toContain(div);
    });

    it('excludes tabindex="-1"', () => {
      const container = document.createElement('div');
      const div = document.createElement('div');
      div.setAttribute('tabindex', '-1');
      container.appendChild(div);

      const focusable = getFocusableElements(container);
      expect(focusable).not.toContain(div);
    });
  });

  describe('trapFocus', () => {
    it('does nothing for non-Tab keys', () => {
      const container = document.createElement('div');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const spy = vi.spyOn(event, 'preventDefault');
      trapFocus(container, event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('does nothing when no focusable elements', () => {
      const container = document.createElement('div');
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const spy = vi.spyOn(event, 'preventDefault');
      trapFocus(container, event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('wraps focus from last to first on Tab', () => {
      const container = document.createElement('div');
      const first = document.createElement('button');
      const last = document.createElement('button');
      container.appendChild(first);
      container.appendChild(last);
      document.body.appendChild(container);

      last.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      const focusSpy = vi.spyOn(first, 'focus');

      trapFocus(container, event);

      expect(preventSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();

      document.body.removeChild(container);
    });

    it('wraps focus from first to last on Shift+Tab', () => {
      const container = document.createElement('div');
      const first = document.createElement('button');
      const last = document.createElement('button');
      container.appendChild(first);
      container.appendChild(last);
      document.body.appendChild(container);

      first.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      const focusSpy = vi.spyOn(last, 'focus');

      trapFocus(container, event);

      expect(preventSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();

      document.body.removeChild(container);
    });
  });

  describe('scrollIntoViewIfNeeded', () => {
    it('scrolls when element is not visible', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: -200, bottom: -100, left: 0, right: 100,
        width: 100, height: 100, x: 0, y: -200, toJSON: () => {},
      });
      const scrollSpy = vi.spyOn(el, 'scrollIntoView');

      scrollIntoViewIfNeeded(el);

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
    });

    it('does not scroll when element is already visible', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 100, bottom: 200, left: 50, right: 150,
        width: 100, height: 100, x: 50, y: 100, toJSON: () => {},
      });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      const scrollSpy = vi.spyOn(el, 'scrollIntoView');

      scrollIntoViewIfNeeded(el);

      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('uses custom scroll behavior', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: -200, bottom: -100, left: 0, right: 100,
        width: 100, height: 100, x: 0, y: -200, toJSON: () => {},
      });
      const scrollSpy = vi.spyOn(el, 'scrollIntoView');

      scrollIntoViewIfNeeded(el, 'instant');

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'instant', block: 'nearest' });
    });
  });

  describe('copyToClipboard', () => {
    it('returns true on successful copy', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
      expect(await copyToClipboard('hello')).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    });

    it('returns false on failure', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
      });
      expect(await copyToClipboard('hello')).toBe(false);
    });
  });

  describe('getDataAttribute / setDataAttribute', () => {
    it('gets data attribute value', () => {
      const el = document.createElement('div');
      el.setAttribute('data-testid', 'foo');
      expect(getDataAttribute(el, 'testid')).toBe('foo');
    });

    it('returns null for missing attribute', () => {
      const el = document.createElement('div');
      expect(getDataAttribute(el, 'missing')).toBeNull();
    });

    it('sets data attribute', () => {
      const el = document.createElement('div');
      setDataAttribute(el, 'theme', 'dark');
      expect(el.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('matchesSelector', () => {
    it('returns true for matching selector', () => {
      const el = document.createElement('div');
      el.classList.add('active');
      expect(matchesSelector(el, 'div.active')).toBe(true);
    });

    it('returns false for non-matching selector', () => {
      const el = document.createElement('div');
      expect(matchesSelector(el, 'span')).toBe(false);
    });
  });

  describe('closestAncestor', () => {
    it('finds closest matching ancestor', () => {
      const outer = document.createElement('div');
      outer.classList.add('container');
      const inner = document.createElement('span');
      outer.appendChild(inner);
      document.body.appendChild(outer);

      expect(closestAncestor(inner, '.container')).toBe(outer);

      document.body.removeChild(outer);
    });

    it('returns null when no match found', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);

      expect(closestAncestor(el, '.nonexistent')).toBeNull();

      document.body.removeChild(el);
    });
  });

  describe('domUtils — additional coverage', () => {
    it('isElementVisible returns false when element is left of viewport', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 100, bottom: 200, left: -200, right: -100,
        width: 100, height: 100, x: -200, y: 100, toJSON: () => {},
      });
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      expect(isElementVisible(el)).toBe(false);
    });

    it('isElementFullyVisible returns false when element right exceeds viewport', () => {
      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 10, bottom: 100, left: 900, right: 1100,
        width: 200, height: 90, x: 900, y: 10, toJSON: () => {},
      });
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      expect(isElementFullyVisible(el)).toBe(false);
    });

    it('isNearBottom returns true at exact threshold boundary', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 400 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(isNearBottom(el, 100)).toBe(true);
    });

    it('getScrollPercent returns rounded value', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 333 });
      Object.defineProperty(el, 'scrollHeight', { value: 1000 });
      Object.defineProperty(el, 'clientHeight', { value: 500 });
      expect(getScrollPercent(el)).toBe(67);
    });

    it('getFocusableElements includes select and textarea', () => {
      const container = document.createElement('div');
      const select = document.createElement('select');
      const textarea = document.createElement('textarea');
      container.appendChild(select);
      container.appendChild(textarea);
      const focusable = getFocusableElements(container);
      expect(focusable).toContain(select);
      expect(focusable).toContain(textarea);
    });

    it('trapFocus does not prevent default when active is not first/last', () => {
      const container = document.createElement('div');
      const first = document.createElement('button');
      const middle = document.createElement('button');
      const last = document.createElement('button');
      container.appendChild(first);
      container.appendChild(middle);
      container.appendChild(last);
      document.body.appendChild(container);
      middle.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const spy = vi.spyOn(event, 'preventDefault');
      trapFocus(container, event);
      expect(spy).not.toHaveBeenCalled();
      document.body.removeChild(container);
    });

    it('copyToClipboard passes exact text argument', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      await copyToClipboard('test content');
      expect(writeText).toHaveBeenCalledWith('test content');
    });

    it('setDataAttribute overwrites existing attribute', () => {
      const el = document.createElement('div');
      setDataAttribute(el, 'value', 'first');
      setDataAttribute(el, 'value', 'second');
      expect(getDataAttribute(el, 'value')).toBe('second');
    });
  });
});
