import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TagInput from './TagInput';

describe('TagInput', () => {
  // -- Rendering --
  it('renders with role="group"', () => {
    render(<TagInput />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<TagInput />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '태그 입력');
  });

  it('uses custom label for aria-label', () => {
    render(<TagInput label="기술 스택" />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '기술 스택');
  });

  it('renders label text element', () => {
    render(<TagInput label="기술 스택" />);
    expect(screen.getByText('기술 스택')).toBeInTheDocument();
  });

  it('renders input field', () => {
    render(<TagInput />);
    expect(screen.getByLabelText('새 태그 추가')).toBeInTheDocument();
  });

  it('shows placeholder when no tags', () => {
    render(<TagInput placeholder="태그를 입력하세요" />);
    expect(screen.getByPlaceholderText('태그를 입력하세요')).toBeInTheDocument();
  });

  it('hides placeholder when tags exist', () => {
    render(<TagInput tags={['React']} placeholder="태그를 입력하세요" />);
    const input = screen.getByLabelText('새 태그 추가');
    expect(input).not.toHaveAttribute('placeholder', '태그를 입력하세요');
  });

  it('renders existing tags', () => {
    render(<TagInput tags={['React', 'TypeScript', 'Vitest']} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Vitest')).toBeInTheDocument();
  });

  it('renders tags as listitems', () => {
    render(<TagInput tags={['React', 'Vue']} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('renders tag list container', () => {
    render(<TagInput tags={['React']} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('applies custom id to input', () => {
    render(<TagInput id="my-tags" />);
    expect(screen.getByLabelText('새 태그 추가')).toHaveAttribute('id', 'my-tags');
  });

  // -- Sizes --
  it('applies small size class', () => {
    render(<TagInput size="small" />);
    expect(screen.getByRole('group').className).toContain('tag-input--small');
  });

  it('applies medium size class by default', () => {
    render(<TagInput />);
    expect(screen.getByRole('group').className).toContain('tag-input--medium');
  });

  it('applies large size class', () => {
    render(<TagInput size="large" />);
    expect(screen.getByRole('group').className).toContain('tag-input--large');
  });

  // -- Variants --
  it('applies default variant class', () => {
    render(<TagInput />);
    expect(screen.getByRole('group').className).toContain('tag-input--default');
  });

  it('applies error variant class', () => {
    render(<TagInput variant="error" />);
    expect(screen.getByRole('group').className).toContain('tag-input--error');
  });

  it('applies success variant class', () => {
    render(<TagInput variant="success" />);
    expect(screen.getByRole('group').className).toContain('tag-input--success');
  });

  // -- Adding tags --
  it('adds tag on Enter key', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('adds tag on comma separator', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'React,' } });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('trims whitespace from added tags', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: '  React  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('does not add empty tag', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onTagAdd callback when tag is added', () => {
    const onTagAdd = vi.fn();
    render(<TagInput tags={[]} onTagAdd={onTagAdd} onChange={vi.fn()} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onTagAdd).toHaveBeenCalledWith('React');
  });

  it('clears input after adding tag', () => {
    render(<TagInput tags={[]} onChange={vi.fn()} />);
    const input = screen.getByLabelText('새 태그 추가') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('');
  });

  // -- Duplicate prevention --
  it('prevents duplicate tags by default', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['React']} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows duplicates when allowDuplicates is true', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['React']} onChange={onChange} allowDuplicates />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['React', 'React']);
  });

  // -- Max tags --
  it('respects maxTags limit', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['a', 'b']} maxTags={2} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'c' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables input when maxTags reached', () => {
    render(<TagInput tags={['a', 'b']} maxTags={2} />);
    expect(screen.getByLabelText('새 태그 추가')).toBeDisabled();
  });

  it('shows tag count when maxTags is set', () => {
    render(<TagInput tags={['a', 'b']} maxTags={5} />);
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  // -- Max length --
  it('rejects tag exceeding maxLength', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} maxLength={3} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'toolong' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts tag within maxLength', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} maxLength={5} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'ok' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['ok']);
  });

  // -- Validation --
  it('rejects tag that fails validateTag', () => {
    const onChange = vi.fn();
    const validateTag = (tag: string) => tag.startsWith('#');
    render(<TagInput tags={[]} validateTag={validateTag} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'notag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts tag that passes validateTag', () => {
    const onChange = vi.fn();
    const validateTag = (tag: string) => tag.startsWith('#');
    render(<TagInput tags={[]} validateTag={validateTag} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: '#valid' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['#valid']);
  });

  // -- Removing tags --
  it('renders remove buttons for each tag', () => {
    render(<TagInput tags={['React', 'Vue']} />);
    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons).toHaveLength(2);
  });

  it('removes tag when remove button clicked', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['React', 'Vue']} onChange={onChange} />);
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['Vue']);
  });

  it('calls onTagRemove callback', () => {
    const onTagRemove = vi.fn();
    render(<TagInput tags={['React', 'Vue']} onChange={vi.fn()} onTagRemove={onTagRemove} />);
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    expect(onTagRemove).toHaveBeenCalledWith('React');
  });

  it('remove button has aria-label with tag name', () => {
    render(<TagInput tags={['React']} />);
    expect(screen.getByRole('button', { name: 'React 삭제' })).toBeInTheDocument();
  });

  // -- Backspace removal --
  it('highlights last tag on Backspace with empty input', () => {
    render(<TagInput tags={['React', 'Vue']} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.keyDown(input, { key: 'Backspace' });
    const items = screen.getAllByRole('listitem');
    expect(items[1].className).toContain('tag-input-tag--focused');
  });

  it('removes focused tag on second Backspace', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['React', 'Vue']} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    // First backspace: focus last tag
    fireEvent.keyDown(input, { key: 'Backspace' });
    // Second backspace: remove focused tag
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  // -- Keyboard navigation --
  it('navigates left to previous tag with ArrowLeft', () => {
    render(<TagInput tags={['React', 'Vue', 'Angular']} />);
    const input = screen.getByLabelText('새 태그 추가');
    // Press backspace to focus last tag
    fireEvent.keyDown(input, { key: 'Backspace' });
    // Press ArrowLeft to go to second tag
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    const items = screen.getAllByRole('listitem');
    expect(items[1].className).toContain('tag-input-tag--focused');
  });

  it('navigates right with ArrowRight', () => {
    render(<TagInput tags={['React', 'Vue', 'Angular']} />);
    const input = screen.getByLabelText('새 태그 추가');
    // Focus first tag via backspace + arrow left
    fireEvent.keyDown(input, { key: 'Backspace' });
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    // Navigate right
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    const items = screen.getAllByRole('listitem');
    expect(items[2].className).toContain('tag-input-tag--focused');
  });

  it('clears tag focus on ArrowRight past last tag', () => {
    render(<TagInput tags={['React']} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.keyDown(input, { key: 'Backspace' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).not.toContain('tag-input-tag--focused');
  });

  it('removes focused tag with Delete key', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['React', 'Vue']} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.keyDown(input, { key: 'Backspace' });
    fireEvent.keyDown(input, { key: 'Delete' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('resets tag focus when typing a character', () => {
    render(<TagInput tags={['React']} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.keyDown(input, { key: 'Backspace' });
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).toContain('tag-input-tag--focused');
    fireEvent.keyDown(input, { key: 'a' });
    expect(items[0].className).not.toContain('tag-input-tag--focused');
  });

  // -- Paste --
  it('handles comma-separated paste', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.paste(input, {
      clipboardData: { getData: () => 'React,Vue,Angular' },
    });
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  // -- Disabled state --
  it('applies disabled class', () => {
    render(<TagInput disabled />);
    expect(screen.getByRole('group').className).toContain('tag-input--disabled');
  });

  it('disables input when disabled', () => {
    render(<TagInput disabled />);
    expect(screen.getByLabelText('새 태그 추가')).toBeDisabled();
  });

  it('does not show remove buttons when disabled', () => {
    render(<TagInput tags={['React']} disabled />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // -- ReadOnly state --
  it('applies readonly class', () => {
    render(<TagInput readOnly />);
    expect(screen.getByRole('group').className).toContain('tag-input--readonly');
  });

  it('hides input field in readOnly mode', () => {
    render(<TagInput readOnly />);
    expect(screen.queryByLabelText('새 태그 추가')).not.toBeInTheDocument();
  });

  it('does not show remove buttons in readOnly mode', () => {
    render(<TagInput tags={['React']} readOnly />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // -- Container click --
  it('focuses input when container is clicked', () => {
    render(<TagInput />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.click(screen.getByRole('group'));
    expect(document.activeElement).toBe(input);
  });

  // -- Tag click --
  it('focuses tag on click', () => {
    render(<TagInput tags={['React', 'Vue']} />);
    const items = screen.getAllByRole('listitem');
    fireEvent.click(items[0]);
    expect(items[0].className).toContain('tag-input-tag--focused');
  });

  // -- ArrowLeft boundary --
  it('ArrowLeft stops at first tag', () => {
    render(<TagInput tags={['React', 'Vue']} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.keyDown(input, { key: 'Backspace' });
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).toContain('tag-input-tag--focused');
  });

  // -- Custom separator --
  it('supports custom separator keys', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} separator={['Enter', ' ']} />);
    const input = screen.getByLabelText('새 태그 추가');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  // -- No count without maxTags --
  it('does not show count without maxTags', () => {
    render(<TagInput tags={['a', 'b']} />);
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  // -- Tag text CSS class --
  it('tag text has correct CSS class', () => {
    render(<TagInput tags={['React']} />);
    const tagText = screen.getByText('React');
    expect(tagText.className).toContain('tag-input-tag-text');
  });

  // -- Wrapper CSS class --
  it('wrapper has correct CSS class', () => {
    const { container } = render(<TagInput />);
    expect(container.firstChild).toHaveClass('tag-input-wrapper');
  });
});
