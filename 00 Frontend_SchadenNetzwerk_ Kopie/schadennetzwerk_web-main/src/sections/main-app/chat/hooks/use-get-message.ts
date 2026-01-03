import UserModel from 'src/models/UserModel';
import ChatMessageModel from 'src/models/ChatMessageModel';

// ----------------------------------------------------------------------

type Props = {
  chatInfo: ChatMessageModel;
  currentUserId: string;
  users: UserModel[];
};

export default function useGetMessage({ chatInfo, currentUserId, users }: Props) {
  const senderInfo = users.find((user) => user.userId === chatInfo.senderId);

  const senderDetails =
    chatInfo.senderId === currentUserId
      ? {
        type: 'me',
      }
      : {
        avatarUrl: senderInfo?.photoURL || "",
        firstName: senderInfo?.firstName || "Admin",
      };

  const me = senderDetails.type === 'me';

  const hasImage = chatInfo.contentType.includes('image');

  return {
    hasImage,
    me,
    senderDetails,
  };
}
