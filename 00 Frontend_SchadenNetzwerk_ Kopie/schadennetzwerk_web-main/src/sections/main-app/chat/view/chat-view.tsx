import { Timestamp } from 'firebase/firestore';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useParams, useRouter, useSearchParams } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { CHAT_LIMIT } from 'src/constants/firebase';
import ChatRoomModel from 'src/models/ChatRoomModel';
import ChatMessageModel from 'src/models/ChatMessageModel';
import { getMyChatPartners } from 'src/services/firebase/functions';
import { getDocument, getChatRoomSnapInfo, getChatMessageSnapInfo } from 'src/services/firebase/firebaseFirestore';

import { UserRole, QueryResultType } from 'src/types/enums';

import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatHeaderDetail from '../chat-header-detail';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderCompose from '../chat-header-compose';

// ----------------------------------------------------------------------

export default function ChatView() {

  const [damageInfo, setDamageInfo] = useState<DamageModel | null>(null);
  const { user } = useAuthContext();

  const { t } = useTranslate();

  const router = useRouter();

  const searchParams = useSearchParams();

  const params = useParams();

  const { damageId } = params;

  const [selectedConversationId, setSelectedConversationId] = useState<string>("");

  const [recipients, setRecipients] = useState<UserModel[]>([]);

  const [users, setUsers] = useState<UserModel[]>([]);

  const [chatRooms, setChatRooms] = useState<ChatRoomModel[]>([]);

  const [messages, setMessages] = useState<ChatMessageModel[]>([]);

  const [isNavLoading, setIsNavLoading] = useState(false);

  const [loadMoreCount, setLoadMoreCount] = useState(0);

  const [lastCreatedAt, setLastCreatedAt] = useState<Timestamp | null>(null);

  const handleGetChatRoomSuccess = (snap: ChatRoomModel[]) => {
    setChatRooms(snap);
    setIsNavLoading(false);
  }

  const handleChatMessageSuccess = (snap: ChatMessageModel[]) => {
    if (snap.length === CHAT_LIMIT) {
      setLastCreatedAt(snap[0].createdAt);
    } else {
      setLastCreatedAt(null);
    }
    setMessages(snap);
  }

  const handleLoadMoreSuccess = (snap: ChatMessageModel[]) => {
    if (snap.length === 0) { return }
    setLastCreatedAt(snap[0].createdAt);
    setMessages(prev => [...snap, ...prev]);
  }

  const getParticipants = useMemo(() => {
    if (selectedConversationId && chatRooms.length && users.length) {
      const chatRoom = chatRooms.find(it => it.chatRoomId === selectedConversationId);
      if (chatRoom) {
        // Get participants from users
        let partners: string[] = [];
        if (chatRoom.participants.length === 2 && chatRoom.participants[0] === chatRoom.participants[1]) {// this is the case of send message to himself
          partners.push(chatRoom.participants[0]);
        } else {
          partners = chatRoom.participants.filter((it) => it !== user?.id);
        }
        const partnerUsers = users.filter(it => partners.includes(it.userId));
        return partnerUsers;
      }
      return null;
    }
    return null;
  }, [chatRooms, selectedConversationId, user?.id, users]);

  const getMoreMessages = useCallback(async () => {
    setLoadMoreCount(prev => prev + 1);
  }, []);

  const getMyPartners = useCallback(async () => {
    try {
      const res: any = await getMyChatPartners({ damageId });
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        return;
      }
      const partners = res.data.userList;
      const filteredPartners = partners.filter((it: any) => it.fullName || it.firstName || it.lastName);
      const userModels = filteredPartners.map((it: any) => new UserModel(it));
      setUsers(userModels);
    } catch (error) {
      console.error(error);
    }
  }, [damageId]);

  const isChatOwner = useMemo(() => {
    const chatRoom = chatRooms.find(it => it.chatRoomId === selectedConversationId);
    if (chatRoom) {
      return chatRoom.creator === user?.id;
    }
    return false;
  }, [chatRooms, selectedConversationId, user?.id]);

  useEffect(() => {
    getMyPartners();
    // Fetch damage info if damageId exists
    if (damageId) {
      getDocument('damage', damageId, DamageModel).then((damage) => {
        if (damage) setDamageInfo(damage);
      });
    } else {
      setDamageInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [damageId])

  useEffect(() => {
    if (user) {
      setIsNavLoading(true);
      const isAdmin = user?.role === UserRole.Lawyer || user?.role === UserRole.Admin;
      const unSubscribe = getChatRoomSnapInfo(user.id, handleGetChatRoomSuccess, damageId || "common", isAdmin);
      return () => {
        unSubscribe();
      }
    }
    return () => { }
  }, [damageId, user]);

  useEffect(() => {
    if (selectedConversationId) {
      const unSubscribe = getChatMessageSnapInfo(selectedConversationId, handleChatMessageSuccess);
      return () => {
        unSubscribe();
      }
    }
    setMessages([]);
    return () => { }
  }, [selectedConversationId]);

  useEffect(() => {
    // Set selected id
    const id = searchParams.get('id');
    setSelectedConversationId(id || "");
  }, [searchParams]);

  const handleAddRecipients = useCallback((selected: UserModel[]) => {
    setRecipients(selected);
  }, []);

  useEffect(() => {
    if (loadMoreCount > 1 && selectedConversationId && messages.length >= CHAT_LIMIT && lastCreatedAt !== null) {
      const unSubscribe = getChatMessageSnapInfo(selectedConversationId, handleLoadMoreSuccess, lastCreatedAt);
      return () => {
        unSubscribe();
      }
    }
    return () => { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreCount]);

  const details = !!messages.length;

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
    >
      {selectedConversationId && getParticipants && getParticipants.length > 0 ? (
        <>
          {
            details &&
            <ChatHeaderDetail
              participants={getParticipants}
              isChatOwner={isChatOwner}
              roomId={selectedConversationId}
              onDeleteChatRoom={() => router.push(paths.dashboard.chat.damageChat(damageId || ""))} />}
        </>
      ) : (
        <ChatHeaderCompose contacts={users} damageId={damageId} onAddRecipient={handleAddRecipients} />
      )}
    </Stack>
  );

  const renderNav = (
    <ChatNav
      contacts={users}
      chatRooms={chatRooms}
      loading={isNavLoading}
      damageId={damageId}
      selectedConversationId={selectedConversationId}
    />
  );

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <ChatMessageList users={users} messages={messages} chatRoom={chatRooms.find(it => it.chatRoomId === selectedConversationId)} onFetchMore={getMoreMessages} />

      <ChatMessageInput
        recipients={recipients}
        onAddRecipients={handleAddRecipients}
        damageId={damageId}
        //
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
      />
    </Stack>
  );

  return (
    <Container maxWidth={false}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: damageInfo ? 1 : 3, md: damageInfo ? 2 : 5 },
          color: 'text.tableText',
        }}
      >
        {t('chat')}
      </Typography>
      {damageInfo && (
        <Stack direction="row" spacing={2} sx={{ mb: { xs: 2, md: 3 }, px: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{t('damage_number')}:</strong> {damageInfo.insuranceDamageNumber || damageInfo.damageNumber || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{t('customer')}:</strong> {damageInfo.customerFirstName} {damageInfo.customerLastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{t('license_plate')}:</strong> {damageInfo.customerVehicleLicensePlate}
          </Typography>
        </Stack>
      )}
      <Stack component={Card} direction="row" sx={{ height: '72vh' }}>
        {renderNav}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          {renderHead}

          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: 'hidden',
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderMessages}

            {details && getParticipants && getParticipants.length > 0 && <ChatRoom conversations={messages} participants={getParticipants} />}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
