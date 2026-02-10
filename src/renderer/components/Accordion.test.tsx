import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Accordion, { AccordionItem } from './Accordion';

const mockItems: AccordionItem[] = [
  { id: '1', title: '첫 번째 항목', content: '첫 번째 내용' },
  { id: '2', title: '두 번째 항목', content: '두 번째 내용' },
  { id: '3', title: '세 번째 항목', content: '세 번째 내용' },
];

describe('Accordion', () => {
  it('renders all items', () => {
    render(<Accordion items={mockItems} />);
    expect(screen.getByText('첫 번째 항목')).toBeInTheDocument();
    expect(screen.getByText('두 번째 항목')).toBeInTheDocument();
    expect(screen.getByText('세 번째 항목')).toBeInTheDocument();
  });

  it('starts with all items collapsed by default', () => {
    render(<Accordion items={mockItems} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('expands an item when clicked', () => {
    render(<Accordion items={mockItems} />);
    const firstButton = screen.getByText('첫 번째 항목').closest('button')!;
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('첫 번째 내용')).toBeVisible();
  });

  it('collapses an expanded item when clicked again', () => {
    render(<Accordion items={mockItems} />);
    const firstButton = screen.getByText('첫 번째 항목').closest('button')!;
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('only allows one expanded item in single mode (default)', () => {
    render(<Accordion items={mockItems} />);
    const firstButton = screen.getByText('첫 번째 항목').closest('button')!;
    const secondButton = screen.getByText('두 번째 항목').closest('button')!;

    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(secondButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows multiple expanded items when multiple=true', () => {
    render(<Accordion items={mockItems} multiple />);
    const firstButton = screen.getByText('첫 번째 항목').closest('button')!;
    const secondButton = screen.getByText('두 번째 항목').closest('button')!;

    fireEvent.click(firstButton);
    fireEvent.click(secondButton);

    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports defaultExpanded prop', () => {
    render(<Accordion items={mockItems} defaultExpanded={['2']} />);
    const firstButton = screen.getByText('첫 번째 항목').closest('button')!;
    const secondButton = screen.getByText('두 번째 항목').closest('button')!;

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('두 번째 내용')).toBeVisible();
  });

  it('supports multiple defaultExpanded items', () => {
    render(<Accordion items={mockItems} defaultExpanded={['1', '3']} />);
    const firstButton = screen.getByText('첫 번째 항목').closest('button')!;
    const thirdButton = screen.getByText('세 번째 항목').closest('button')!;

    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(thirdButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('disables items with disabled=true', () => {
    const itemsWithDisabled: AccordionItem[] = [
      { id: '1', title: '활성', content: '내용 1' },
      { id: '2', title: '비활성', content: '내용 2', disabled: true },
    ];
    render(<Accordion items={itemsWithDisabled} />);
    const disabledButton = screen.getByText('비활성').closest('button')!;
    expect(disabledButton).toBeDisabled();
  });

  it('does not expand disabled items when clicked', () => {
    const itemsWithDisabled: AccordionItem[] = [
      { id: '1', title: '비활성', content: '내용', disabled: true },
    ];
    render(<Accordion items={itemsWithDisabled} />);
    const button = screen.getByText('비활성').closest('button')!;
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('has correct aria-controls linking header to panel', () => {
    render(<Accordion items={[mockItems[0]]} />);
    const button = screen.getByRole('button');
    const panelId = button.getAttribute('aria-controls');
    expect(panelId).toBe('accordion-panel-1');
    expect(document.getElementById(panelId!)).toBeInTheDocument();
  });

  it('panel has role="region" and aria-labelledby', () => {
    render(<Accordion items={[mockItems[0]]} defaultExpanded={['1']} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-labelledby', 'accordion-header-1');
  });

  it('shows collapsed icon when collapsed and expanded icon when expanded', () => {
    render(<Accordion items={[mockItems[0]]} />);
    const icon = screen.getByText('▸');
    expect(icon).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('▾')).toBeInTheDocument();
  });

  it('applies expanded CSS class to expanded items', () => {
    render(<Accordion items={[mockItems[0]]} />);
    const item = screen.getByRole('button').closest('.accordion-item')!;
    expect(item).not.toHaveClass('accordion-item--expanded');

    fireEvent.click(screen.getByRole('button'));
    expect(item).toHaveClass('accordion-item--expanded');
  });

  it('applies disabled CSS class to disabled items', () => {
    const items: AccordionItem[] = [
      { id: '1', title: '비활성', content: '내용', disabled: true },
    ];
    render(<Accordion items={items} />);
    const item = screen.getByRole('button').closest('.accordion-item')!;
    expect(item).toHaveClass('accordion-item--disabled');
  });

  it('renders ReactNode content', () => {
    const items: AccordionItem[] = [
      { id: '1', title: '제목', content: <span data-testid="custom">커스텀 콘텐츠</span> },
    ];
    render(<Accordion items={items} defaultExpanded={['1']} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.getByText('커스텀 콘텐츠')).toBeVisible();
  });

  it('hides panel content when collapsed', () => {
    render(<Accordion items={[mockItems[0]]} />);
    const panel = document.getElementById('accordion-panel-1')!;
    expect(panel).toHaveAttribute('hidden');
  });

  it('renders empty items array without error', () => {
    render(<Accordion items={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
