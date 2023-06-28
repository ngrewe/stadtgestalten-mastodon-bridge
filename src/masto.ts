import { login } from 'masto';
import type { Env } from './worker';
import { EventList } from './stadtgestalten';
import escapeStringRegexp from 'escape-string-regexp';
import 'dayjs/locale/de';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { stadtGestaltenUrl } from './util';
dayjs.locale('de');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

/** The generic type stored in a promise */
type PromiseT<C extends Promise<any>> = C extends Promise<infer T> ? T : unknown;

const STORE: { client: PromiseT<ReturnType<typeof login>> | null } = { client: null };

export const getClient = async (env: Env) => {
	if (!STORE.client) {
		STORE.client = await login({
			url: env.MASTODON_URL,
			accessToken: env.MASTODON_TOKEN,
		});
	}
	return STORE.client;
};

const UID_PATTERN = /(?<eventId>\d+)@/;

export const postEvents = async (env: Env, events: EventList) => {
	const client = await getClient(env);
	const contentPattern = new RegExp(`${escapeStringRegexp(stadtGestaltenUrl(env) + '/stadt/content/')}(?<eventId>\\d+)`);
	const ownId = await client.v1.accounts.lookup({ acct: env.MASTODON_ACCOUNT });
	const statuses = client.v1.accounts.listStatuses(ownId.id, { excludeReblogs: true, excludeReplies: true });
	const bridgedIds = new Set<string>();
	for await (const statusChunk of statuses) {
		for (const status of statusChunk) {
			const res = contentPattern.exec(status.content);
			if (res?.groups?.eventId) {
				bridgedIds.add(res.groups.eventId);
			}
		}
	}
	for (const event of events) {
		const res = UID_PATTERN.exec(event.uid);
		if (!res?.groups?.eventId) {
			// This should not happen
			continue;
		}
		if (bridgedIds.has(res?.groups?.eventId)) {
			// We already wrote this one;
			continue;
		}
		const startDate = dayjs(event.start).tz(event.start.tz).format('LLL');
		const hashTags = env.MASTODON_HASHTAGS
			? '\n' +
			  env.MASTODON_HASHTAGS.split(',')
					.map((h) => `#${h.trim()}`)
					.join(' ')
			: '';

		const statusText = `${event.summary} am ${startDate}${hashTags}\n\n${stadtGestaltenUrl(env)}/stadt/content/${res.groups.eventId}`;
		await client.v1.statuses.create({
			status: statusText,
			language: 'de',
		});
	}
	return null;
};
