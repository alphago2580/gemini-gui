import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PasswordInput, { calculateStrength, PasswordRequirement } from './PasswordInput';

describe('PasswordInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders with placeholder', () => {
    render(<PasswordInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<PasswordInput {...defaultProps} placeholder="새 비밀번호" />);
    expect(screen.getByPlaceholderText('새 비밀번호')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<PasswordInput {...defaultProps} label="비밀번호" />);
    expect(screen.getByText('비밀번호')).toBeInTheDocument();
  });

  it('renders as password type by default', () => {
    render(<PasswordInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('비밀번호 입력');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders value in input', () => {
    render(<PasswordInput {...defaultProps} value="secret" />);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toHaveValue('secret');
  });

  // --- Visibility toggle ---

  it('shows toggle button', () => {
    render(<PasswordInput {...defaultProps} />);
    expect(screen.getByLabelText('비밀번호 표시')).toBeInTheDocument();
  });

  it('toggles to text type on button click', () => {
    render(<PasswordInput {...defaultProps} />);
    const toggle = screen.getByLabelText('비밀번호 표시');
    fireEvent.click(toggle);
    const input = screen.getByPlaceholderText('비밀번호 입력');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('toggles back to password type on second click', () => {
    render(<PasswordInput {...defaultProps} />);
    const toggle = screen.getByLabelText('비밀번호 표시');
    fireEvent.click(toggle);
    const hideToggle = screen.getByLabelText('비밀번호 숨기기');
    fireEvent.click(hideToggle);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toHaveAttribute('type', 'password');
  });

  it('changes toggle label when visible', () => {
    render(<PasswordInput {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('비밀번호 표시'));
    expect(screen.getByLabelText('비밀번호 숨기기')).toBeInTheDocument();
  });

  // --- onChange ---

  it('calls onChange when typing', () => {
    render(<PasswordInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('비밀번호 입력');
    fireEvent.change(input, { target: { value: 'test123' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('test123');
  });

  // --- Disabled ---

  it('disables input when disabled', () => {
    render(<PasswordInput {...defaultProps} disabled />);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toBeDisabled();
  });

  it('disables toggle when disabled', () => {
    render(<PasswordInput {...defaultProps} disabled />);
    expect(screen.getByLabelText('비밀번호 표시')).toBeDisabled();
  });

  it('applies disabled class', () => {
    const { container } = render(<PasswordInput {...defaultProps} disabled />);
    expect(container.querySelector('.password-input--disabled')).toBeInTheDocument();
  });

  // --- Error ---

  it('renders error message', () => {
    render(<PasswordInput {...defaultProps} error="비밀번호가 필요합니다" />);
    expect(screen.getByText('비밀번호가 필요합니다')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('sets aria-invalid when error', () => {
    render(<PasswordInput {...defaultProps} error="에러" />);
    const input = screen.getByPlaceholderText('비밀번호 입력');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies error class', () => {
    const { container } = render(<PasswordInput {...defaultProps} error="에러" />);
    expect(container.querySelector('.password-input--error')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies sm size class', () => {
    const { container } = render(<PasswordInput {...defaultProps} size="sm" />);
    expect(container.querySelector('.password-input--sm')).toBeInTheDocument();
  });

  it('applies md size class by default', () => {
    const { container } = render(<PasswordInput {...defaultProps} />);
    expect(container.querySelector('.password-input--md')).toBeInTheDocument();
  });

  it('applies lg size class', () => {
    const { container } = render(<PasswordInput {...defaultProps} size="lg" />);
    expect(container.querySelector('.password-input--lg')).toBeInTheDocument();
  });

  // --- Strength meter ---

  it('does not show strength when showStrength is false', () => {
    render(<PasswordInput {...defaultProps} value="test" />);
    expect(screen.queryByLabelText('비밀번호 강도')).not.toBeInTheDocument();
  });

  it('does not show strength when value is empty', () => {
    render(<PasswordInput {...defaultProps} showStrength />);
    expect(screen.queryByLabelText('비밀번호 강도')).not.toBeInTheDocument();
  });

  it('shows strength when showStrength and has value', () => {
    render(<PasswordInput {...defaultProps} showStrength value="a" />);
    expect(screen.getByLabelText('비밀번호 강도')).toBeInTheDocument();
  });

  it('shows weak strength for short password', () => {
    render(<PasswordInput {...defaultProps} showStrength value="a" />);
    expect(screen.getByText('약함')).toBeInTheDocument();
  });

  it('shows strong strength for complex password', () => {
    render(<PasswordInput {...defaultProps} showStrength value="Abc123!@#xyz" />);
    expect(screen.getByText('강함')).toBeInTheDocument();
  });

  it('shows fair strength for medium password', () => {
    render(<PasswordInput {...defaultProps} showStrength value="abcdefgh" />);
    expect(screen.getByText('보통')).toBeInTheDocument();
  });

  it('shows good strength for good password', () => {
    // "Abcde1" meets 3/5 default requirements (uppercase, lowercase, digit) = 60% => good
    render(<PasswordInput {...defaultProps} showStrength value="Abcde1" />);
    expect(screen.getByText('좋음')).toBeInTheDocument();
  });

  // --- Requirements ---

  it('does not show requirements when showRequirements is false', () => {
    render(<PasswordInput {...defaultProps} value="test" />);
    expect(screen.queryByLabelText('비밀번호 요구사항')).not.toBeInTheDocument();
  });

  it('does not show requirements when value is empty', () => {
    render(<PasswordInput {...defaultProps} showRequirements />);
    expect(screen.queryByLabelText('비밀번호 요구사항')).not.toBeInTheDocument();
  });

  it('shows requirements when showRequirements and has value', () => {
    render(<PasswordInput {...defaultProps} showRequirements value="a" />);
    expect(screen.getByLabelText('비밀번호 요구사항')).toBeInTheDocument();
  });

  it('shows default requirements', () => {
    render(<PasswordInput {...defaultProps} showRequirements value="a" />);
    expect(screen.getByText('8자 이상')).toBeInTheDocument();
    expect(screen.getByText('대문자 포함')).toBeInTheDocument();
    expect(screen.getByText('소문자 포함')).toBeInTheDocument();
    expect(screen.getByText('숫자 포함')).toBeInTheDocument();
    expect(screen.getByText('특수문자 포함')).toBeInTheDocument();
  });

  it('marks met requirements', () => {
    const { container } = render(
      <PasswordInput {...defaultProps} showRequirements value="abcdefgh" />
    );
    const met = container.querySelectorAll('.password-requirement--met');
    // Should match: 8자 이상, 소문자 포함
    expect(met.length).toBe(2);
  });

  it('marks unmet requirements', () => {
    const { container } = render(
      <PasswordInput {...defaultProps} showRequirements value="ab" />
    );
    const unmet = container.querySelectorAll('.password-requirement--unmet');
    // 8자 미만, 대문자 없음, 숫자 없음, 특수문자 없음
    expect(unmet.length).toBe(4);
  });

  it('uses custom requirements', () => {
    const customReqs: PasswordRequirement[] = [
      { label: '4자 이상', test: (v) => v.length >= 4 },
      { label: '숫자 필요', test: (v) => /\d/.test(v) },
    ];
    render(
      <PasswordInput {...defaultProps} showRequirements requirements={customReqs} value="abc" />
    );
    expect(screen.getByText('4자 이상')).toBeInTheDocument();
    expect(screen.getByText('숫자 필요')).toBeInTheDocument();
    expect(screen.queryByText('8자 이상')).not.toBeInTheDocument();
  });

  // --- Accessibility ---

  it('sets aria-label from label prop', () => {
    render(<PasswordInput {...defaultProps} label="비밀번호" />);
    const input = screen.getByPlaceholderText('비밀번호 입력');
    expect(input).toHaveAttribute('aria-label', '비밀번호');
  });

  it('sets aria-label from placeholder when no label', () => {
    render(<PasswordInput {...defaultProps} placeholder="비밀번호" />);
    const input = screen.getByPlaceholderText('비밀번호');
    expect(input).toHaveAttribute('aria-label', '비밀번호');
  });

  // --- maxLength ---

  it('applies maxLength to input', () => {
    render(<PasswordInput {...defaultProps} maxLength={20} />);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toHaveAttribute('maxLength', '20');
  });

  // --- autoComplete ---

  it('applies default autoComplete', () => {
    render(<PasswordInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toHaveAttribute('autoComplete', 'current-password');
  });

  it('applies custom autoComplete', () => {
    render(<PasswordInput {...defaultProps} autoComplete="new-password" />);
    expect(screen.getByPlaceholderText('비밀번호 입력')).toHaveAttribute('autoComplete', 'new-password');
  });
});

describe('calculateStrength', () => {
  const defaultReqs: PasswordRequirement[] = [
    { label: '8자 이상', test: (v) => v.length >= 8 },
    { label: '대문자', test: (v) => /[A-Z]/.test(v) },
    { label: '소문자', test: (v) => /[a-z]/.test(v) },
    { label: '숫자', test: (v) => /\d/.test(v) },
  ];

  it('returns weak for empty string', () => {
    expect(calculateStrength('', defaultReqs)).toBe('weak');
  });

  it('returns weak when <= 25% requirements met', () => {
    expect(calculateStrength('A', defaultReqs)).toBe('weak');
  });

  it('returns fair when <= 50% requirements met', () => {
    expect(calculateStrength('Ab', defaultReqs)).toBe('fair');
  });

  it('returns good when <= 75% requirements met', () => {
    expect(calculateStrength('Ab1', defaultReqs)).toBe('good');
  });

  it('returns strong when > 75% requirements met', () => {
    expect(calculateStrength('Abcdefg1', defaultReqs)).toBe('strong');
  });
});
