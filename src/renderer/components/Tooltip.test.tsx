import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    expect(screen.getByText('버튼')).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('버튼').parentElement!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('도움말')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('버튼').parentElement!;
    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show tooltip if mouse leaves before delay', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('버튼').parentElement!;
    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.mouseLeave(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('uses custom delay', () => {
    render(
      <Tooltip content="도움말" delay={500}>
        <button>버튼</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('버튼').parentElement!;
    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('applies top position class by default', () => {
    const { container } = render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('.tooltip--top')).toBeInTheDocument();
  });

  it('applies bottom position class', () => {
    const { container } = render(
      <Tooltip content="도움말" position="bottom">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('.tooltip--bottom')).toBeInTheDocument();
  });

  it('applies left position class', () => {
    const { container } = render(
      <Tooltip content="도움말" position="left">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('.tooltip--left')).toBeInTheDocument();
  });

  it('applies right position class', () => {
    const { container } = render(
      <Tooltip content="도움말" position="right">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('.tooltip--right')).toBeInTheDocument();
  });

  it('has aria-label with content', () => {
    render(
      <Tooltip content="복사하기">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('버튼').parentElement!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', '복사하기');
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.focus(screen.getByText('버튼').parentElement!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('버튼').parentElement!;
    fireEvent.focus(wrapper);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders arrow element with aria-hidden', () => {
    const { container } = render(
      <Tooltip content="도움말">
        <button>버튼</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const arrow = container.querySelector('.tooltip-arrow');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
  });
});
