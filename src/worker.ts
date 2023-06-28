/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { postEvents } from './masto';
import { getEventsSinceLast } from './stadtgestalten';
export interface Env {
	STADTGESTALTEN_GROUP_SLUG: string;
	STADTGESTALTEN_URL: string;
	MASTODON_URL: string;
	MASTODON_TOKEN: string;
	MASTODON_ACCOUNT: string;
	MASTODON_HASHTAGS: string;
}

// Fix to get node-ical working
(self as any).setImmediate = (fn: any) => setTimeout(fn, 0);

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// A Cron Trigger can make requests to other endpoints on the Internet,
		// publish to a Queue, query a D1 Database, and much more.
		//
		// We'll keep it simple and make an API call to a Cloudflare API:
		const calendar = await getEventsSinceLast(env);
		await postEvents(env, calendar);
	},
};
