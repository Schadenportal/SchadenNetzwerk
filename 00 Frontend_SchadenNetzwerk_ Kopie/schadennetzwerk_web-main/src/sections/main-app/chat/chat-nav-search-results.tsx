import { useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import UserModel from 'src/models/UserModel';
import { useAuthContext } from 'src/auth/hooks';
import ChatRoomModel from 'src/models/ChatRoomModel';

import SearchNotFound from 'src/components/search-not-found';
// ----------------------------------------------------------------------

type Props = {
  query: string;
  users: UserModel[];
  results: ChatRoomModel[];
  onClickResult: (selectedRoom: ChatRoomModel) => void;
};

export default function ChatNavSearchResults({ query, results, users, onClickResult }: Props) {
  const totalResults = results.length;

  const { user } = useAuthContext();

  const notFound = !totalResults && !!query;

  const getUserInfoFromChatRoom = useCallback((chatRoom: ChatRoomModel) => {
    const { participants } = chatRoom;
    const userId = participants.find((participant) => participant !== user?.id);
    const partner = users.find((participant) => participant.userId === userId);
    return partner;
  }, [user?.id, users]);

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          px: 2.5,
          mb: 2,
        }}
      >
        Contacts ({totalResults})
      </Typography>

      {notFound ? (
        <SearchNotFound
          query={query}
          sx={{
            p: 3,
            mx: 'auto',
            width: `calc(100% - 40px)`,
            bgcolor: 'background.neutral',
          }}
        />
      ) : (
        <>
          {results.map((result) => (
            <ListItemButton
              key={result.chatRoomId}
              onClick={() => onClickResult(result)}
              sx={{
                px: 2.5,
                py: 1.5,
                typography: 'subtitle2',
              }}
            >
              <Avatar alt="avatar" src={getUserInfoFromChatRoom(result)?.photoURL} sx={{ mr: 2 }} />
              {getUserInfoFromChatRoom(result)?.firstName} {getUserInfoFromChatRoom(result)?.lastName}
            </ListItemButton>
          ))}
        </>
      )}
    </>
  );
}
