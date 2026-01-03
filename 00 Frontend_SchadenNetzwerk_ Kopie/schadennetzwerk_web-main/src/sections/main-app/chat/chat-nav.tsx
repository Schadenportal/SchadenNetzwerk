import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import UserModel from 'src/models/UserModel';
import { useAuthContext } from 'src/auth/hooks';
import ChatRoomModel from 'src/models/ChatRoomModel';
// import ChatMessageModel from 'src/models/ChatMessageModel';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { ChatRoomTypes } from 'src/types/enums';

import { useCollapseNav } from './hooks';
import ChatNavItem from './chat-nav-item';
import ChatNavAccount from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';
import ChatNavSearchResults from './chat-nav-search-results';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;

const NAV_COLLAPSE_WIDTH = 96;

type Props = {
  loading: boolean;
  selectedConversationId: string;
  contacts: UserModel[];
  chatRooms: ChatRoomModel[];
  damageId?: string;
};

export default function ChatNav({
  loading,
  contacts,
  chatRooms,
  selectedConversationId,
  damageId,
}: Props) {
  const theme = useTheme();

  const router = useRouter();

  const { user } = useAuthContext();
  const { t } = useTranslate();

  const mdUp = useResponsive('up', 'md');

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  const [searchContacts, setSearchContacts] = useState<{
    query: string;
    results: ChatRoomModel[];
  }>({
    query: '',
    results: [],
  });

  useEffect(() => {
    if (!mdUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const handleClickCompose = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    if (damageId) {
      router.push(paths.dashboard.chat.damageChat(damageId));
    } else {
      router.push(paths.dashboard.chat.root);
    }
  }, [damageId, mdUp, onCloseMobile, router]);

  const handleSearchContacts = useCallback(
    (inputValue: string) => {
      setSearchContacts((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const includedUsers = contacts.filter((contact) =>
          (contact.fullName || `${contact.firstName} ${contact.lastName}`).toLowerCase().includes(inputValue)
        );

        // Filter chat rooms with included users id and works only with 1:1 chat
        const results = chatRooms
          .filter(item => item.type === ChatRoomTypes.ONE_TO_ONE)
          .filter((chatRoom) => {
            const participant = chatRoom.participants.find((it) => it !== user?.id);
            return includedUsers.some((item) => item.userId === participant);
          });

        setSearchContacts((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [chatRooms, contacts, user?.id]
  );

  const handleClickAwaySearch = useCallback(() => {
    setSearchContacts({
      query: '',
      results: [],
    });
  }, []);

  const handleClickResult = useCallback(
    (result: ChatRoomModel) => {
      handleClickAwaySearch();

      router.push(`${paths.dashboard.chat}?id=${result.chatRoomId}`);
    },
    [handleClickAwaySearch, router]
  );

  const renderToggleBtn = (
    <IconButton
      onClick={onOpenMobile}
      sx={{
        left: 0,
        top: 84,
        zIndex: 9,
        width: 32,
        height: 32,
        position: 'absolute',
        borderRadius: `0 12px 12px 0`,
        bgcolor: theme.palette.primary.main,
        boxShadow: theme.customShadows.primary,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          bgcolor: theme.palette.primary.darker,
        },
      }}
    >
      <Iconify width={16} icon="solar:users-group-rounded-bold" />
    </IconButton>
  );

  const renderSkeleton = (
    <>
      {[...Array(12)].map((_, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </>
  );

  const renderList = (
    <>
      {chatRooms.map((chatRoom) => (
        <ChatNavItem
          key={chatRoom.chatRoomId}
          collapse={collapseDesktop}
          users={contacts}
          roomInfo={chatRoom}
          selected={chatRoom.chatRoomId === selectedConversationId}
          onCloseMobile={onCloseMobile}
        />
      ))}
    </>
  );

  const renderListResults = (
    <ChatNavSearchResults
      query={searchContacts.query}
      users={contacts}
      results={searchContacts.results}
      onClickResult={handleClickResult}
    />
  );

  const renderSearchInput = (
    <ClickAwayListener onClickAway={handleClickAwaySearch}>
      <TextField
        fullWidth
        value={searchContacts.query}
        onChange={(event) => handleSearchContacts(event.target.value)}
        placeholder={t('contact')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mt: 2.5 }}
      />
    </ClickAwayListener>
  );

  const renderContent = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2.5, pb: 0 }}>
        {!collapseDesktop && (
          <>
            <ChatNavAccount />
            <Box sx={{ flexGrow: 1 }} />
          </>
        )}

        <IconButton onClick={handleToggleNav}>
          <Iconify
            icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          />
        </IconButton>

        {!collapseDesktop && (
          <IconButton onClick={handleClickCompose}>
            <Iconify width={24} icon="solar:user-plus-bold" />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ p: 2.5, pt: 0 }}>{!collapseDesktop && renderSearchInput}</Box>

      <Scrollbar sx={{ pb: 1 }}>
        {searchContacts.query && renderListResults}

        {loading && renderSkeleton}

        {!searchContacts.query && !!chatRooms.length && renderList}
      </Scrollbar>
    </>
  );

  return (
    <>
      {!mdUp && renderToggleBtn}

      {mdUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderRight: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: NAV_COLLAPSE_WIDTH,
            }),
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openMobile}
          onClose={onCloseMobile}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </>
  );
}
