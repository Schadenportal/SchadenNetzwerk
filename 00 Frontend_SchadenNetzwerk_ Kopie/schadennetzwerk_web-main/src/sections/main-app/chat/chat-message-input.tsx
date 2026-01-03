import { format } from 'date-fns';
import { useRef, useMemo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { modifyFileName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';
import { useAuthContext } from 'src/auth/hooks';
import ChatRoomModel from 'src/models/ChatRoomModel';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { setChatRoom, setChatMessage } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import { ChatRoomTypes, QueryResultType } from 'src/types/enums';

// ----------------------------------------------------------------------

type Props = {
  recipients: UserModel[];
  onAddRecipients: (recipients: UserModel[]) => void;
  //
  disabled: boolean;
  selectedConversationId: string;
  damageId?: string;
};

export default function ChatMessageInput({
  recipients,
  onAddRecipients,
  //
  disabled,
  selectedConversationId,
  damageId,
}: Props) {
  const router = useRouter();

  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messageData = useMemo(
    () => ({
      chatRoomId: selectedConversationId,
      senderId: user?.id ?? '',
      attachment: '',
      message,
      contentType: 'text',
      isRead: false
    }),
    [message, selectedConversationId, user?.id]
  );

  const conversationData = useMemo(
    () => ({
      lastMessage: message,
      lastSenderId: user?.id ?? '',
      creator: user?.id ?? '',
      participants: [...recipients.map(it => it.userId), user?.id ?? ''],
      type: recipients.length > 1 ? ChatRoomTypes.GROUP : ChatRoomTypes.ONE_TO_ONE,
      unreadCount: 0,
      damageId: damageId || "common",
    }),
    [damageId, message, recipients, user?.id]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handelFileChange = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (file && selectedConversationId && user) {
      setIsSending(true);
      // Upload file to firesbase firebase first
      try {
        const filePath = `chat/${user.id}/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
        const fileUploadRes = await uploadFile(file, filePath);
        if (fileUploadRes) {
          messageData.attachment = fileUploadRes;
          messageData.contentType = file.type;
          messageData.message = file.name;
          await setChatMessage(messageData);
        }
        setIsSending(false);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(t('something_went_wrong'), {
          variant: 'error',
        });
        setIsSending(false);
      }
    }
  }, [enqueueSnackbar, messageData, selectedConversationId, t, user]);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const sendMessage = useCallback(async () => {
    setIsSending(true);
    if (message) {
      if (selectedConversationId) {
        await setChatMessage(messageData);
      } else {
        if (!damageId && conversationData.participants.length > 2) {
          enqueueSnackbar(t('can_not_make_group_chat'), {
            variant: 'error',
          });
          setIsSending(false);
          return;
        }
        const res: any = await setChatRoom(conversationData);

        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          return;
        }
        const chatData = res.data.data as ChatRoomModel;
        messageData.chatRoomId = chatData.chatRoomId;
        await setChatMessage(messageData);

        if (damageId) {
          router.push(`${paths.dashboard.chat.damageChat(damageId)}?id=${chatData.chatRoomId}`);
        } else {
          router.push(`${paths.dashboard.chat.root}?id=${chatData.chatRoomId}`);
        }

        onAddRecipients([]);
      }
    }
    setMessage('');
  }, [conversationData, damageId, enqueueSnackbar, message, messageData, onAddRecipients, router, selectedConversationId, t]);

  const onSendMessage = useCallback(async () => {
    try {
      await sendMessage();
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
      console.error(error);
    }
  }, [sendMessage]);

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === 'Enter' && !isSending) {
          await sendMessage();
        }
        setIsSending(false);
      } catch (error) {
        setIsSending(false);
        console.error(error);
      }
    },
    [isSending, sendMessage]
  );

  return (
    <>
      <InputBase
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder={t('type_a_message')}
        disabled={disabled}
        startAdornment={
          <IconButton>
            <Iconify icon="eva:smiling-face-fill" />
          </IconButton>

        }
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0 }} alignItems="center">
            {isSending ? (
              <CircularProgress color='primary' size={16} thickness={4} />
            ) : (
              <IconButton onClick={onSendMessage}>
                <Iconify style={{ color: "#00A76F" }} icon="eva:paper-plane-fill" />
              </IconButton>
            )}
            <IconButton onClick={handleAttach}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>
          </Stack>
        }
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      />

      <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handelFileChange} />
    </>
  );
}
