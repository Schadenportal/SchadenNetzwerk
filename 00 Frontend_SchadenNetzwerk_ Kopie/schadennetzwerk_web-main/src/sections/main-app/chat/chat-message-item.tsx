import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { CircularProgress } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { downloadFileFromStorage } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';
import { useAuthContext } from 'src/auth/hooks';
import ChatRoomModel from 'src/models/ChatRoomModel';
import ChatMessageModel from 'src/models/ChatMessageModel';
import { removeMessage } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import { QueryResultType } from 'src/types/enums';

import { useGetMessage } from './hooks';

// ----------------------------------------------------------------------

type Props = {
  chatInfo: ChatMessageModel;
  chatRoomInfo: ChatRoomModel | undefined;
  users: UserModel[];
  onOpenLightbox: (value: string) => void;
};

export default function ChatMessageItem({ chatInfo, chatRoomInfo, users, onOpenLightbox }: Props) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const { me, senderDetails, hasImage } = useGetMessage({
    chatInfo,
    currentUserId: `${user?.id}`,
    users,
  });

  const { firstName, avatarUrl } = senderDetails;

  const { message, createdAt, attachment } = chatInfo;

  const [isSending, setIsSending] = useState(false);

  const downloadFile = () => {
    downloadFileFromStorage(attachment)
  };

  const deleteMessage = async () => {
    setIsSending(true);
    try {
      const res: any = await removeMessage({ chatMessageId: chatInfo.chatMessageId });
      setIsSending(false);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
      setIsSending(false);
    }
  }

  const renderInfo = (
    <Typography
      noWrap
      variant="caption"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...(!me && {
          mr: 'auto',
        }),
      }}
    >
      {!me && `${firstName},`} &nbsp;
      {formatDistanceToNowStrict(createdAt.toDate(), {
        addSuffix: true,
      })}
    </Typography>
  );

  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 320,
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        ...(me && {
          color: 'grey.800',
          bgcolor: 'primary.lighter',
        }),
        ...(hasImage && {
          p: 0,
          bgcolor: 'transparent',
        }),
      }}
    >{
        isSending ? <CircularProgress size={36} /> : (
          <>
            {hasImage ? (
              <Box
                component="img"
                alt="attachment"
                src={attachment}
                onClick={() => onOpenLightbox(attachment)}
                sx={{
                  minHeight: 220,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              />
            ) : (
              <>
                {attachment ? (<>
                  <Iconify icon="eva:file-text-fill" width={24} />
                  <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                    {message}
                  </Typography>
                </>) : message}
              </>
            )}
          </>
        )}
    </Stack>
  );

  const renderActions = (
    <Stack
      direction="row"
      className="message-actions"
      sx={{
        pt: 0.5,
        opacity: 0,
        top: '100%',
        left: 0,
        position: 'absolute',
        transition: (theme) =>
          theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.shorter,
          }),
        ...(me && {
          left: 'unset',
          right: 0,
        }),
      }}
    >
      {attachment && (
        <IconButton size="small" onClick={downloadFile}>
          <Iconify icon="material-symbols:download" width={16} />
        </IconButton>
      )}
      <IconButton size="small" onClick={deleteMessage}>
        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
      </IconButton>
    </Stack>
  );

  return (
    <Stack direction="row" justifyContent={me ? 'flex-end' : 'unset'} sx={{ mb: 5 }}>
      {!me && <Avatar alt={firstName} src={avatarUrl} sx={{ width: 32, height: 32, mr: 2 }} />}

      <Stack alignItems="flex-end">
        {renderInfo}

        <Stack
          direction="row"
          alignItems="center"
          sx={{
            position: 'relative',
            '&:hover': {
              '& .message-actions': {
                opacity: 1,
              },
            },
          }}
        >
          {renderBody}
          {renderActions}
        </Stack>
      </Stack>
    </Stack>
  );
}
