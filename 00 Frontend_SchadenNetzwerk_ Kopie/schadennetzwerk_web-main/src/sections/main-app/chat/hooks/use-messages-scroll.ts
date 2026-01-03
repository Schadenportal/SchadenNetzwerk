import { useRef, useState, useEffect, useCallback } from 'react';

import { CHAT_LIMIT } from 'src/constants/firebase';
import ChatMessageModel from 'src/models/ChatMessageModel';

// ----------------------------------------------------------------------

export default function useMessagesScroll(messages: ChatMessageModel[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollMessagesToBottom = useCallback(() => {
    if (!messages) {
      return;
    }

    if (!messagesEndRef.current) {
      return;
    }

    if (messagesEndRef.current) {
      if (messages.length > 0 && messages.length <= CHAT_LIMIT) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      } else {
        const rest = messages.length % CHAT_LIMIT;
        const restHeight = rest === 0 ? CHAT_LIMIT * 72 : rest * 72;
        messagesEndRef.current.scrollTop = restHeight;
      }
    }
  }, [messages]);

  //
  const [isAtTop, setIsAtTop] = useState(false); // Initially at the top
  const handleScroll = () => {
    const element = messagesEndRef.current;

    if (element) {
      const atTop = element.scrollTop === 0;
      setIsAtTop(atTop);
    }
  };

  useEffect(() => {
    const element = messagesEndRef.current;

    if (element) {
      element.addEventListener('scroll', handleScroll);

      // Initial check (in case content is shorter than viewport)
      handleScroll();
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  //

  useEffect(
    () => {
      scrollMessagesToBottom();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages]
  );

  return {
    messagesEndRef,
    isAtTop,
  };
}
