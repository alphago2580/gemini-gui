import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import Tooltip from './Tooltip';
import Badge from './Badge';
import Switch from './Switch';
import Accordion from './Accordion';
import ProgressBar from './ProgressBar';
import Skeleton from './Skeleton';
import Chip from './Chip';
import Divider from './Divider';

describe('Accessibility (axe-core)', () => {
  describe('ConfirmDialog', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          title="삭제 확인"
          message="이 항목을 삭제하시겠습니까?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with warning variant', async () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          title="경고"
          message="변경 사항이 저장되지 않습니다."
          variant="warning"
          confirmLabel="계속"
          cancelLabel="돌아가기"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Toast', () => {
    it('has no accessibility violations with single toast', async () => {
      const { container } = render(
        <Toast
          toasts={[{ id: '1', type: 'success', message: '저장되었습니다.' }]}
          onDismiss={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with multiple toasts', async () => {
      const { container } = render(
        <Toast
          toasts={[
            { id: '1', type: 'success', message: '저장 완료' },
            { id: '2', type: 'error', message: '오류 발생' },
            { id: '3', type: 'info', message: '알림' },
          ]}
          onDismiss={() => {}}
          onDismissAll={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tooltip', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Tooltip content="도움말 텍스트">
          <button>버튼</button>
        </Tooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Badge', () => {
    it('has no violations with count badge', async () => {
      const { container } = render(
        <Badge count={5} variant="primary">
          <button>메시지</button>
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with dot badge', async () => {
      const { container } = render(
        <Badge dot variant="error">
          <button>알림</button>
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations as standalone badge', async () => {
      const { container } = render(
        <Badge count={42} variant="success" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Switch', () => {
    it('has no violations when unchecked', async () => {
      const { container } = render(
        <Switch checked={false} onChange={() => {}} label="다크 모드" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations when checked', async () => {
      const { container } = render(
        <Switch checked={true} onChange={() => {}} label="알림 소리" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations when disabled', async () => {
      const { container } = render(
        <Switch checked={false} onChange={() => {}} label="비활성" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Accordion', () => {
    it('has no violations with collapsed items', async () => {
      const { container } = render(
        <Accordion
          items={[
            { id: '1', title: '일반 설정', content: <p>일반 설정 내용</p> },
            { id: '2', title: '고급 설정', content: <p>고급 설정 내용</p> },
          ]}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with expanded items', async () => {
      const { container } = render(
        <Accordion
          items={[
            { id: '1', title: '일반 설정', content: <p>일반 설정 내용</p> },
            { id: '2', title: '고급 설정', content: <p>고급 설정 내용</p> },
          ]}
          defaultExpanded={['1']}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with disabled items', async () => {
      const { container } = render(
        <Accordion
          items={[
            { id: '1', title: '활성 항목', content: <p>내용</p> },
            { id: '2', title: '비활성 항목', content: <p>내용</p>, disabled: true },
          ]}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ProgressBar', () => {
    it('has no violations with basic progress', async () => {
      const { container } = render(
        <ProgressBar value={65} label="업로드 진행률" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with percentage display', async () => {
      const { container } = render(
        <ProgressBar value={30} max={100} showPercentage label="다운로드" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations at boundary values', async () => {
      const { container } = render(
        <>
          <ProgressBar value={0} label="시작" />
          <ProgressBar value={100} label="완료" variant="success" />
        </>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Skeleton', () => {
    it('has no violations with text variant', async () => {
      const { container } = render(
        <Skeleton variant="text" lines={3} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with circular variant', async () => {
      const { container } = render(
        <Skeleton variant="circular" width={48} height={48} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with rectangular variant', async () => {
      const { container } = render(
        <Skeleton variant="rectangular" width="100%" height={200} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Chip', () => {
    it('has no violations with basic chip', async () => {
      const { container } = render(
        <Chip label="React" variant="primary" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with removable chip', async () => {
      const { container } = render(
        <Chip label="TypeScript" removable onRemove={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with clickable selected chip', async () => {
      const { container } = render(
        <Chip label="선택됨" onClick={() => {}} selected />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations when disabled', async () => {
      const { container } = render(
        <Chip label="비활성" disabled onClick={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Divider', () => {
    it('has no violations with horizontal divider', async () => {
      const { container } = render(
        <div>
          <p>위 내용</p>
          <Divider />
          <p>아래 내용</p>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with labeled divider', async () => {
      const { container } = render(
        <div>
          <p>위 내용</p>
          <Divider label="또는" />
          <p>아래 내용</p>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with vertical divider', async () => {
      const { container } = render(
        <div style={{ display: 'flex' }}>
          <span>왼쪽</span>
          <Divider orientation="vertical" />
          <span>오른쪽</span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
