import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertBanner from './AlertBanner';

describe('AlertBanner', () => {
  // --- Rendering ---

  it('renders message content', () => {
    render(<AlertBanner>업데이트가 있습니다.</AlertBanner>);
    expect(screen.getByText('업데이트가 있습니다.')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<AlertBanner title="알림">내용입니다.</AlertBanner>);
    expect(screen.getByText('알림')).toBeInTheDocument();
  });

  it('renders default info icon', () => {
    render(<AlertBanner variant="info">정보</AlertBanner>);
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('renders default success icon', () => {
    render(<AlertBanner variant="success">성공</AlertBanner>);
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders default warning icon', () => {
    render(<AlertBanner variant="warning">주의</AlertBanner>);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders default error icon', () => {
    render(<AlertBanner variant="error">오류</AlertBanner>);
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<AlertBanner icon="🔔">알림</AlertBanner>);
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies info variant class by default', () => {
    const { container } = render(<AlertBanner>메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-info')).toBeInTheDocument();
  });

  it('applies success variant class', () => {
    const { container } = render(<AlertBanner variant="success">메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-success')).toBeInTheDocument();
  });

  it('applies warning variant class', () => {
    const { container } = render(<AlertBanner variant="warning">메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-warning')).toBeInTheDocument();
  });

  it('applies error variant class', () => {
    const { container } = render(<AlertBanner variant="error">메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-error')).toBeInTheDocument();
  });

  // --- Roles ---

  it('has role="status" for info variant', () => {
    render(<AlertBanner variant="info">메시지</AlertBanner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has role="status" for success variant', () => {
    render(<AlertBanner variant="success">메시지</AlertBanner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has role="alert" for warning variant', () => {
    render(<AlertBanner variant="warning">메시지</AlertBanner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has role="alert" for error variant', () => {
    render(<AlertBanner variant="error">메시지</AlertBanner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // --- Dismissible ---

  it('does not show dismiss button by default', () => {
    render(<AlertBanner>메시지</AlertBanner>);
    expect(screen.queryByLabelText('닫기')).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(<AlertBanner dismissible>메시지</AlertBanner>);
    expect(screen.getByLabelText('닫기')).toBeInTheDocument();
  });

  it('removes banner on dismiss click', () => {
    render(<AlertBanner dismissible>메시지</AlertBanner>);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(screen.queryByText('메시지')).not.toBeInTheDocument();
  });

  it('calls onDismiss callback', () => {
    const onDismiss = vi.fn();
    render(<AlertBanner dismissible onDismiss={onDismiss}>메시지</AlertBanner>);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  // --- Actions ---

  it('renders action buttons', () => {
    const actions = [
      { id: 'retry', label: '다시 시도', onClick: vi.fn() },
      { id: 'cancel', label: '취소', onClick: vi.fn() },
    ];
    render(<AlertBanner actions={actions}>오류 발생</AlertBanner>);
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('calls action onClick when clicked', () => {
    const onClick = vi.fn();
    const actions = [{ id: 'retry', label: '다시 시도', onClick }];
    render(<AlertBanner actions={actions}>오류 발생</AlertBanner>);
    fireEvent.click(screen.getByText('다시 시도'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render actions container when no actions', () => {
    const { container } = render(<AlertBanner>메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-actions')).not.toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = render(<AlertBanner size="small">메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<AlertBanner>메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<AlertBanner size="large">메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-large')).toBeInTheDocument();
  });

  // --- Bordered ---

  it('does not apply bordered class by default', () => {
    const { container } = render(<AlertBanner>메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-bordered')).not.toBeInTheDocument();
  });

  it('applies bordered class when bordered', () => {
    const { container } = render(<AlertBanner bordered>메시지</AlertBanner>);
    expect(container.querySelector('.alert-banner-bordered')).toBeInTheDocument();
  });

  // --- Complex content ---

  it('renders JSX children', () => {
    render(
      <AlertBanner title="업데이트">
        <strong>v2.0</strong>이 출시되었습니다.
      </AlertBanner>
    );
    expect(screen.getByText('v2.0')).toBeInTheDocument();
    expect(screen.getByText('업데이트')).toBeInTheDocument();
  });

  // --- Icon hidden from screen readers ---

  it('icon is aria-hidden', () => {
    const { container } = render(<AlertBanner>메시지</AlertBanner>);
    const icon = container.querySelector('.alert-banner-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
