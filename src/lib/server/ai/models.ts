import { createOpenAI } from '@ai-sdk/openai';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

export const myProvider = customProvider({
	languageModels: {
		'chat-model': openai('gpt-4-mini'),
		'chat-model-reasoning': wrapLanguageModel({
			model: openai('deepseek-r1-distill-llama-70b'),
			middleware: extractReasoningMiddleware({ tagName: 'think' })
		}),
		'title-model': openai('gpt-4-mini'),
		'artifact-model': openai('gpt-4-mini')
	},
	imageModels: {
		'small-model': openai.image('gpt-4-mini')
	}
});
