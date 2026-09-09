import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('calendar scheduling', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('generates a complete six-week month grid', async () => {
    const { getMonthDays } = await import('./main.jsx');
    const days = getMonthDays(2026, 8);

    expect(days).toHaveLength(42);
    expect(days.some((day) => day.date === '2026-09-02')).toBe(true);
    expect(days[0].monthOffset).toBe(-1);
  });

  it('adds a scheduled post and moves it by drag and drop', async () => {
    const { App } = await import('./main.jsx');
    const { unmount } = await import('@testing-library/react').then(({ render }) => render(<App />));

    fireEvent.click(screen.getByRole('button', { name: /new post/i }));
    fireEvent.change(screen.getByPlaceholderText('What are you sharing?'), { target: { value: 'Performance review post' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-09-03' } });
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));
    expect(screen.getAllByText('Performance review post').length).toBeGreaterThan(0);

    const post = screen.getAllByText('Performance review post')[0].closest('button');
    let draggedId;
    const dataTransfer = { setData: (_key, value) => { draggedId = value; }, getData: () => draggedId };
    fireEvent.dragStart(post, { dataTransfer });
    fireEvent.drop(document.querySelector('[data-date="2026-09-10"]'), { dataTransfer });
    expect(screen.getByText(/Selected date.*Sep 10/)).toBeInTheDocument();
    expect(screen.getAllByText('Performance review post').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(document.querySelector('.summary-metrics span')).toHaveTextContent('0 app renders');
    unmount();
  });
});