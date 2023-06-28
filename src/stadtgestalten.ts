import { async as ICal, VEvent } from 'node-ical';

import type { Env } from './worker';

export type EventList = VEvent[];

export const getEventsSinceLast: (env: Env) => Promise<EventList> = async (env: Env) => {
	const baseUrl = `${env.STADTGESTALTEN_URL}/${env.STADTGESTALTEN_GROUP_SLUG}/events/public.ics`;
	const resp = await fetch(baseUrl);
	if (!resp.ok) {
		throw new Error(`Failed to fetch ${baseUrl}: ${resp.statusText} (${resp.status})`);
	}
	const data = await ICal.parseICS(await resp.text());
	return Object.values(data)
		.map((e) => (e.type === 'VEVENT' ? e : null))
		.filter((e) => !!e) as VEvent[];
};
