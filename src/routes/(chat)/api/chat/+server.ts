import { myProvider } from '$lib/server/ai/models';
import { systemPrompt } from '$lib/server/ai/prompts.js';
import { generateTitleFromUserMessage } from '$lib/server/ai/utils';
import { deleteChatById, getChatById, saveChat, saveMessages } from '$lib/server/db/queries.js';
import type { Chat } from '$lib/server/db/schema';
import { getMostRecentUserMessage, getTrailingMessageId } from '$lib/utils/chat.js';
import { allowAnonymousChats } from '$lib/utils/constants.js';
import { error } from '@sveltejs/kit';
import {
    createUIMessageStreamResponse,
    smoothStream,
    streamText,
    type UIMessage,
    stepCountIs,
	createUIMessageStream,
	generateId,
	convertToModelMessages
} from 'ai';
import { ok, safeTry } from 'neverthrow';

export async function POST({ request, locals: { user }, cookies }) {
	// TODO: zod?
	const { id, messages }: { id: string; messages: UIMessage[] } = await request.json();
	const selectedChatModel = cookies.get('selected-model');

	if (!user && !allowAnonymousChats) {
		error(401, 'Unauthorized');
	}

	if (!selectedChatModel) {
		error(400, 'No chat model selected');
	}

	const userMessage = getMostRecentUserMessage(messages);

	if (!userMessage) {
		error(400, 'No user message found');
	}

	if (user) {
		await safeTry(async function* () {
			let chat: Chat;
			const chatResult = await getChatById({ id });
			if (chatResult.isErr()) {
				if (chatResult.error._tag !== 'DbEntityNotFoundError') {
					return chatResult;
				}
				const title = yield* generateTitleFromUserMessage({ message: userMessage });
				chat = yield* saveChat({ id, userId: user.id, title });
			} else {
				chat = chatResult.value;
			}

			if (chat.userId !== user.id) {
				error(403, 'Forbidden');
			}

            yield* saveMessages({
				messages: [
					{
						chatId: id,
						id: userMessage.id,
						role: userMessage.role,
						parts: userMessage.parts,
						createdAt: new Date()
					}
				]
			});

			return ok(undefined);
		}).orElse(() => error(500, 'An error occurred while processing your request'));
	}

	const stream = createUIMessageStream({
		execute: ({ writer: UIMessageStreamWriter }) => {
			// Implementation details for the message stream
			const result = streamText({
				model: myProvider.languageModel(selectedChatModel),
				system: systemPrompt({ selectedChatModel }),
				messages: convertToModelMessages(messages),
				stopWhen: stepCountIs(5),
				experimental_activeTools: [],
				experimental_transform: smoothStream({ chunking: 'word' }),
			});

			result.toUIMessageStreamResponse({
				originalMessages: messages,
				generateMessageId: generateId,
				onFinish: async ({ messages, responseMessage}) => {
					// Handle the result of the stream
					if (!user) return;
					const messagesToSave = messages.map(message => {
						return {
							id: message.id,
							chatId: id,
							role: message.role,
							parts: message.parts,
							createdAt: new Date()
						};
					});
					await saveMessages({
						messages: messagesToSave
					});
				}
			})
		}
	});

	return createUIMessageStreamResponse({ stream });
}

export async function DELETE({ locals: { user }, request }) {
	// TODO: zod
	const { id }: { id: string } = await request.json();
	if (!user) {
		error(401, 'Unauthorized');
	}

	return await getChatById({ id })
		.andTee((chat) => {
			if (chat.userId !== user.id) {
				error(403, 'Forbidden');
			}
		})
		.andThen(deleteChatById)
		.match(
			() => new Response('Chat deleted', { status: 200 }),
			() => error(500, 'An error occurred while processing your request')
		);
}
