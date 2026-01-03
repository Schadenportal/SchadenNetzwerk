import { useEffect } from 'react';

import Box from '@mui/material/Box';

import UserModel from 'src/models/UserModel';
import ChatRoomModel from 'src/models/ChatRoomModel';
import ChatMessageModel from 'src/models/ChatMessageModel';

import Scrollbar from 'src/components/scrollbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';

import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';

// ----------------------------------------------------------------------

type Props = {
  messages: ChatMessageModel[];
  chatRoom: ChatRoomModel | undefined;
  users: UserModel[];
  onFetchMore: VoidFunction;
};

export default function ChatMessageList({ messages = [], chatRoom, users, onFetchMore }: Props) {
  const { messagesEndRef, isAtTop } = useMessagesScroll(messages);

  const slides = messages
    .filter((message) => message.contentType.includes('image'))
    .map((message) => ({ src: message.attachment }));

  const lightbox = useLightBox(slides);

  useEffect(() => {
    if (isAtTop) {
      onFetchMore();
    }
  }, [isAtTop, onFetchMore]);
  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, py: 5, height: 1 }}>
        <Box>
          {messages.map((message) => (
            <ChatMessageItem
              key={message.chatMessageId}
              chatInfo={message}
              users={users}
              chatRoomInfo={chatRoom}
              onOpenLightbox={(attachment) => lightbox.onOpen(attachment)}
            />
          ))}
        </Box>
      </Scrollbar>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
