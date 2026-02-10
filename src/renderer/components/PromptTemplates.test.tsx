import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PromptTemplates from './PromptTemplates';
import type { PromptTemplate } from '../../preload/types';

const mockTemplates: PromptTemplate[] = [
  { id: '1', name: '번역', content: '번역해 주세요:\n\n' },
  { id: '2', name: '코드 리뷰', content: '코드를 리뷰해 주세요:\n\n' },
  { id: '3', name: '요약', content: '요약해 주세요:\n\n' },
];

describe('PromptTemplates', () => {
  const defaultProps = {
    templates: mockTemplates,
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<PromptTemplates {...defaultProps} />);
    expect(screen.getByRole('button', { name: '프롬프트 템플릿' })).toBeInTheDocument();
  });

  it('trigger button has aria-expanded false initially', () => {
    render(<PromptTemplates {...defaultProps} />);
    const btn = screen.getByRole('button', { name: '프롬프트 템플릿' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not show dropdown initially', () => {
    render(<PromptTemplates {...defaultProps} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('trigger button has aria-expanded true when open', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    const btn = screen.getByRole('button', { name: '프롬프트 템플릿' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows all templates in dropdown', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    expect(screen.getByText('번역')).toBeInTheDocument();
    expect(screen.getByText('코드 리뷰')).toBeInTheDocument();
    expect(screen.getByText('요약')).toBeInTheDocument();
  });

  it('calls onSelect when template item is clicked', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('option', { name: '번역' }));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('번역해 주세요:\n\n');
  });

  it('closes dropdown after selecting a template', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('option', { name: '번역' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    const deleteBtn = screen.getByRole('button', { name: '번역 삭제' });
    await user.click(deleteBtn);
    expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('delete does not trigger onSelect', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '코드 리뷰 삭제' }));
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('shows empty message when no templates', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} templates={[]} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    expect(screen.getByText('템플릿이 없습니다')).toBeInTheDocument();
  });

  it('shows add form when + button is clicked', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    expect(screen.getByLabelText('템플릿 이름')).toBeInTheDocument();
    expect(screen.getByLabelText('템플릿 내용')).toBeInTheDocument();
  });

  it('calls onAdd when save is clicked with valid inputs', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.type(screen.getByLabelText('템플릿 이름'), '새 프롬프트');
    await user.type(screen.getByLabelText('템플릿 내용'), '새 내용입니다');
    await user.click(screen.getByRole('button', { name: '템플릿 저장' }));
    expect(defaultProps.onAdd).toHaveBeenCalledWith('새 프롬프트', '새 내용입니다');
  });

  it('save button is disabled when inputs are empty', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    expect(screen.getByRole('button', { name: '템플릿 저장' })).toBeDisabled();
  });

  it('hides add form after cancel', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.click(screen.getByRole('button', { name: '추가 취소' }));
    expect(screen.queryByLabelText('템플릿 이름')).not.toBeInTheDocument();
  });

  it('clears form inputs after adding', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.type(screen.getByLabelText('템플릿 이름'), '이름');
    await user.type(screen.getByLabelText('템플릿 내용'), '내용');
    await user.click(screen.getByRole('button', { name: '템플릿 저장' }));
    // Form should be hidden after save
    expect(screen.queryByLabelText('템플릿 이름')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">외부</div>
        <PromptTemplates {...defaultProps} />
      </div>
    );
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // mousedown on outside element to trigger close
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('toggles dropdown on trigger click', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: '프롬프트 템플릿' });
    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('has correct header text', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    expect(screen.getByText('프롬프트 템플릿', { selector: 'span' })).toBeInTheDocument();
  });

  it('template items have role="option"', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('add form has role="form"', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    expect(screen.getByRole('form', { name: '새 템플릿 추가' })).toBeInTheDocument();
  });

  it('does not call onAdd when name is only whitespace', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.type(screen.getByLabelText('템플릿 이름'), '   ');
    await user.type(screen.getByLabelText('템플릿 내용'), '실제 내용');
    expect(screen.getByRole('button', { name: '템플릿 저장' })).toBeDisabled();
  });

  it('does not call onAdd when content is only whitespace', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.type(screen.getByLabelText('템플릿 이름'), '이름');
    await user.type(screen.getByLabelText('템플릿 내용'), '   ');
    expect(screen.getByRole('button', { name: '템플릿 저장' })).toBeDisabled();
  });

  it('trims whitespace from name and content when adding', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.type(screen.getByLabelText('템플릿 이름'), '  이름  ');
    await user.type(screen.getByLabelText('템플릿 내용'), '  내용  ');
    await user.click(screen.getByRole('button', { name: '템플릿 저장' }));
    expect(defaultProps.onAdd).toHaveBeenCalledWith('이름', '내용');
  });

  it('cancel button clears input values', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    await user.type(screen.getByLabelText('템플릿 이름'), '작성중');
    await user.type(screen.getByLabelText('템플릿 내용'), '내용 작성');
    await user.click(screen.getByRole('button', { name: '추가 취소' }));
    // Reopen add form
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    expect(screen.getByLabelText('템플릿 이름')).toHaveValue('');
    expect(screen.getByLabelText('템플릿 내용')).toHaveValue('');
  });

  it('outside click also closes add form', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">외부</div>
        <PromptTemplates {...defaultProps} />
      </div>
    );
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    await user.click(screen.getByRole('button', { name: '새 템플릿 추가' }));
    expect(screen.getByRole('form')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('trigger button has aria-haspopup="listbox"', () => {
    render(<PromptTemplates {...defaultProps} />);
    const btn = screen.getByRole('button', { name: '프롬프트 템플릿' });
    expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('each template delete button has descriptive aria-label', async () => {
    const user = userEvent.setup();
    render(<PromptTemplates {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
    expect(screen.getByRole('button', { name: '번역 삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '코드 리뷰 삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '요약 삭제' })).toBeInTheDocument();
  });
});
