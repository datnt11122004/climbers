import { Context as DefaultContext, SessionFlavor } from 'grammy';
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action';
import type { HydrateFlavor } from '@grammyjs/hydrate';
import type { I18nFlavor } from '@grammyjs/i18n';
import { Logger } from '@nestjs/common';
import { type Conversation as DefaultConversation, type ConversationFlavor } from '@grammyjs/conversations';
import { ParseModeFlavor } from '@grammyjs/parse-mode';

export type SessionData = {
	authenticated: boolean;
	userId?: number;
	botId?: number;
};

type ExtendedContextFlavor = {
	logger: Logger;
};

export type Context = ParseModeFlavor<
	HydrateFlavor<
		DefaultContext &
			ExtendedContextFlavor &
			SessionFlavor<SessionData> &
			ConversationFlavor &
			I18nFlavor &
			AutoChatActionFlavor
	>
>;

export type Conversation = DefaultConversation<Context>;
