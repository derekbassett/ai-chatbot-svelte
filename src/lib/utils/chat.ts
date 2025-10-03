import type { AssistantModelMessage, CoreAssistantMessage, CoreToolMessage, ToolModelMessage, UIMessage } from 'ai';
import type { Message, Document } from '$lib/server/db/schema';

export function convertToUIMessages(messages: Array<Message>): Array<UIMessage> {
	return messages.map((message) => ({
		id: message.id,
		parts: message.parts as UIMessage['parts'],
		role: message.role as UIMessage['role'],
		createdAt: message.createdAt,
	}));
}

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
	const userMessages = messages.filter((message) => message.role === 'user');
	return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(documents: Array<Document>, index: number) {
	if (!documents) return new Date();
	if (index > documents.length) return new Date();

	return documents[index].createdAt;
}

type ResponseMessageWithoutId = ToolModelMessage | AssistantModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
	messages
}: {
	messages: Array<ResponseMessage>;
}): string | null {
	const trailingMessage = messages.at(-1);

	if (!trailingMessage) return null;

	return trailingMessage.id;
}
