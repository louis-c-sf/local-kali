export function createMessageDraft(activeConversationId: string) {
  return {
    text: "",
    markupText: "",
    conversationId: activeConversationId,
    files: [],
  };
}
