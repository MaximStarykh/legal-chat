import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../App';

vi.mock('../components/chat/ChatInterface', () => ({
  default: () => <div>ChatInterface</div>,
  ChatInterface: () => <div>ChatInterface</div>,
}));

describe('App', () => {
  it('renders application header', () => {
    render(<App />);
    expect(screen.getByText('oLegal')).toBeInTheDocument();
  });
});
