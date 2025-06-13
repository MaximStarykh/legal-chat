import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import ChatInterface from '../components/chat/ChatInterface';
import { WELCOME_TITLE } from '../constants';
import * as hook from '../hooks/useChat';
import '@testing-library/jest-dom';

vi.mock('../hooks/useChat');

const mockUseChat = hook as { useChat: vi.Mock };

describe('ChatInterface', () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      value: vi.fn(),
      writable: true,
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows welcome screen when no messages', () => {
    mockUseChat.useChat.mockReturnValue({
      messages: [],
      handleSendMessage: vi.fn(),
      error: null,
      loading: false,
    });
    render(<ChatInterface />);
    expect(screen.getByText(WELCOME_TITLE)).toBeInTheDocument();
  });

  it('renders messages when present', () => {
    mockUseChat.useChat.mockReturnValue({
      messages: [{ role: 'user', parts: [{ text: 'hi' }] }],
      handleSendMessage: vi.fn(),
      error: null,
      loading: false,
    });
    render(<ChatInterface />);
    expect(screen.queryByText(WELCOME_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it('calls handleSendMessage on submit', async () => {
    const send = vi.fn();
    mockUseChat.useChat.mockReturnValue({
      messages: [],
      handleSendMessage: send,
      error: null,
      loading: false,
    });
    render(<ChatInterface />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/chat message/i), 'hello');
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(send).toHaveBeenCalledWith('hello');
  });
});
