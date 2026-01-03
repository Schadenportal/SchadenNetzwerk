import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';

import { useBoolean } from 'src/hooks/use-boolean';

import { fToNow } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';
import { deleteChatRoom } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { QueryResultType } from 'src/types/enums';

// ----------------------------------------------------------------------

type Props = {
  participants: UserModel[];
  isChatOwner: boolean;
  roomId: string;
  onDeleteChatRoom: VoidFunction;
};

export default function ChatHeaderDetail({ participants, isChatOwner, roomId, onDeleteChatRoom }: Props) {

  const [isDeleting, setIsDeleting] = useState(false);

  const group = participants.length > 1;
  const confirm = useBoolean();
  const { t } = useTranslate();

  const { enqueueSnackbar } = useSnackbar();

  const singleParticipant = participants[0];

  const deleteChatRoomTask = async () => {
    setIsDeleting(true);
    // Your delete chat room task here
    await deleteChatRoom({ chatRoomId: roomId }).then((res: any) => {
      setIsDeleting(false);
      confirm.onFalse();
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('deleted_successfully'), { variant: "success" });
      onDeleteChatRoom();
    }).catch((error) => {
      console.error(error);
      enqueueSnackbar(t('something_went_wrong'), { variant: "error" });
      setIsDeleting(false);
      confirm.onFalse();
    });
  }

  const renderGroup = (
    <AvatarGroup
      max={3}
      sx={{
        [`& .${avatarGroupClasses.avatar}`]: {
          width: 32,
          height: 32,
        },
      }}
    >
      {participants.map((participant) => (
        <Avatar key={participant.userId} alt={participant.firstName} src={participant.photoURL} />
      ))}
    </AvatarGroup>
  );

  const renderSingle = (
    <Stack flexGrow={1} direction="row" alignItems="center" spacing={2}>
      <Badge
        variant={singleParticipant.isOnline ? 'dot' : 'standard'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar src={singleParticipant.photoURL} alt={singleParticipant.firstName} />
      </Badge>

      <ListItemText
        primary={`${singleParticipant.firstName} ${singleParticipant.lastName}`}
        secondary={
          !singleParticipant.isOnline
            ? fToNow(singleParticipant.lastOnlineAt?.toDate() || "")
            : "Online"
        }
        secondaryTypographyProps={{
          component: 'span',
          ...(singleParticipant.isOnline && {
            textTransform: 'capitalize',
          }),
        }}
      />
    </Stack>
  );

  return (
    <>
      {group ? renderGroup : renderSingle}

      <Stack flexGrow={1} />

      {isChatOwner && (
        <IconButton disabled={isDeleting} onClick={() => confirm.onTrue()}>
          {isDeleting ? (
            <CircularProgress size={24} />
          ) : (
            <Iconify icon="material-symbols:delete" color="error.main" />
          )}
        </IconButton>
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={t('confirm_delete')}
        action={
          <LoadingButton variant="contained" color="error" onClick={deleteChatRoomTask} loading={isDeleting}>
            {t('delete')}
          </LoadingButton>
        }
      />
    </>
  );
}
