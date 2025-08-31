import { IChat } from "../../core/types/chat.type";
import { ChatState } from "./chat.state";

export function updateChatById(
  state: ChatState,
  chatId: string,
  updater: (chat: IChat) => IChat
): ChatState {
  return {
    ...state,
    listChat: state.listChat.map(c =>
      c.id === chatId ? updater(c) : c
    ),
  };
}

export function extractMentions(text: string): string[] {
  const regex = /@(\S+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}
