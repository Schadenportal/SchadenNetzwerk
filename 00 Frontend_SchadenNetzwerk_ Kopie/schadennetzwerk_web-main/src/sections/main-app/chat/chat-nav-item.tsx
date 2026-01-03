import { formatDistanceToNowStrict } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import UserModel from 'src/models/UserModel';
import { useAuthContext } from 'src/auth/hooks';
import ChatRoomModel from 'src/models/ChatRoomModel';
import { updateChatReadTime } from 'src/services/firebase/functions';
import { getChatUnreadCount } from 'src/services/firebase/firebaseFirestore';

import { ChatRoomTypes } from 'src/types/enums';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  collapse: boolean;
  users: UserModel[];
  onCloseMobile: VoidFunction;
  roomInfo: ChatRoomModel;
};

export default function ChatNavItem({ selected, collapse, users, roomInfo, onCloseMobile }: Props) {
  const { user } = useAuthContext();
  const [singleParticipant, setSingleParticipant] = useState<UserModel | null>(null);
  const [groupParticipants, setGroupParticipants] = useState<UserModel[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<number>(0);

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();
  const { damageId } = useParams();

  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp) {
        onCloseMobile();
      }
      updateChatReadTime({ chatRoomId: roomInfo.chatRoomId })
      if (damageId) {
        router.push(`${paths.dashboard.chat.damageChat(damageId)}?id=${roomInfo.chatRoomId}`);
      } else {
        router.push(`${paths.dashboard.chat.root}?id=${roomInfo.chatRoomId}`);
      }
    } catch (error) {
      console.error(error);
    }
  }, [damageId, mdUp, onCloseMobile, roomInfo.chatRoomId, router]);

  const renderGroup = (
    <Badge
      variant="online"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <AvatarGroup variant="compact" sx={{ width: 48, height: 48 }}>
        {groupParticipants.slice(0, 2).map((participant) => (
          <Avatar key={participant.userId} alt="avatar" src={participant.photoURL}>
            {participant?.firstName?.charAt(0).toUpperCase() || participant?.email.charAt(0).toUpperCase()}
          </Avatar>
        ))}
      </AvatarGroup>
    </Badge>
  );

  const renderSingle = (
    <Badge key={singleParticipant?.userId || "online"} variant="online" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Avatar alt="user" src={singleParticipant?.photoURL || ''} sx={{ width: 48, height: 48 }}>
        {singleParticipant?.firstName?.charAt(0).toUpperCase() || singleParticipant?.email.charAt(0).toUpperCase()}
      </Avatar>
    </Badge>
  );

  const displayName = useCallback(() => {
    if (roomInfo.type === ChatRoomTypes.GROUP) {
      return groupParticipants.map((it) => it.fullName || `${it.firstName} ${it.lastName}`).join(', ');
    }
    return singleParticipant?.fullName || `${singleParticipant?.firstName || "-"} ${singleParticipant?.lastName || "-"}` || '';
  }, [groupParticipants, roomInfo.type, singleParticipant]);

  const displayText = useCallback(() => {
    if (roomInfo) {
      const sender = roomInfo.lastSenderId === user?.id ? 'You: ' : '';

      const message = roomInfo.lastMessage === "" ? 'Sent file' : roomInfo.lastMessage;

      return `${sender}${message}`;
    }
    return '';
  }, [roomInfo, user?.id]);

  useEffect(() => {
    if (roomInfo && users.length > 0 && user) {
      let allParticipants: string[] = [];
      if (roomInfo.participants.length === 2 && roomInfo.participants[0] === roomInfo.participants[1]) { // this is the case of send message to himself
        allParticipants.push(roomInfo.participants[0]);
      } else {
        allParticipants = roomInfo.participants.filter((it) => it !== user.id);
      }
      if (roomInfo.type === ChatRoomTypes.GROUP) {
        const participants = users.filter((it) => allParticipants.includes(it.userId));
        if (participants.length > 0) {
          setGroupParticipants(participants);
        }
      } else {
        const participant = users.find((it) => it.userId === allParticipants[0]);
        if (participant) {
          setSingleParticipant(participant);
        }
      }
    }
  }, [roomInfo, user, users]);

  useEffect(() => {
    if (roomInfo && user && roomInfo.participants.includes(user.id)) {
      // Get unread counts
      const getUnreadCount = async () => {
        const lastReadAt = roomInfo.readAts ? roomInfo.readAts[user.id] : undefined;
        const counts = await getChatUnreadCount(roomInfo.chatRoomId, user.id, lastReadAt);
        setUnreadCounts(counts);
      }
      getUnreadCount();
    }
  }, [roomInfo, user]);

  return (
    <ListItemButton
      disableGutters
      onClick={handleClickConversation}
      sx={{
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
      }}
    >

      <Badge
        color="error"
        overlap="circular"
        badgeContent={collapse ? unreadCounts : 0}
      >
        {roomInfo.type === ChatRoomTypes.GROUP ? renderGroup : renderSingle}
      </Badge>

      {!collapse && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={displayName()}
            primaryTypographyProps={{
              noWrap: true,
              variant: 'subtitle2',
            }}
            secondary={displayText()}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: roomInfo.unreadCount ? 'subtitle2' : 'body2',
              color: roomInfo.unreadCount ? 'text.primary' : 'text.secondary',
            }}
          />

          <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
            <Typography
              noWrap
              variant="body2"
              component="span"
              sx={{
                mb: 1.5,
                fontSize: 12,
                color: 'text.disabled',
              }}
            >
              {formatDistanceToNowStrict(roomInfo.updatedAt.toDate(), {
                addSuffix: false,
              })}
            </Typography>

            {/* Badge indicator */}
            {!!unreadCounts && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'info.main',
                  borderRadius: '50%',
                }}
              />
            )}
          </Stack>
        </>
      )}
    </ListItemButton>
  );
}
