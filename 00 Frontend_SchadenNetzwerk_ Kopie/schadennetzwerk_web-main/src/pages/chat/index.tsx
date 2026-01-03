import { Helmet } from "react-helmet-async";

import { ChatView } from "src/sections/main-app/chat/view";

export default function ChatPage() {
  return (
    <>
      <Helmet>
        <title>Chat</title>
      </Helmet>

      <ChatView />
    </>
  );
}
