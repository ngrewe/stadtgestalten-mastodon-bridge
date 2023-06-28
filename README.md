# Stadtgestalten/Grouprise Events to Mastodon Bridge

This bridge takes events published by a group from a [Grouprise](https://grouprise.org/) instance
and publishes them to a Mastodon feed. It runs on a cron schedule in Cloudflare workers. A free
Cloudflare account is sufficient to run this.

## Configuration

| Variable           | Required | Used For |
|--------------------|----------|----------|
|`STADTGESTALTEN_URL`|          |URL where to reach the Grouprise instance (default: `https://stadtgestalten.org`) |
| `STADTGESTALTEN_GROUP_SLUG` | ✅ | The slug of the group you want to publish events for |
| `MASTODON_URL`              | ✅ | URL of your Mastodon instance |
| `MASTODON_ACCOUNT`          | ✅ | Name of your Mastodon account |
| `MASTODON_TOKEN`            | ✅ | Access token with (at least) the following scopes: `read:accounts`, `read:statuses`, `write:statuses` |
| `MASTODON_HASHTAGS`         |   | A comma separated list of hashtags to attach to toots. Can be left empty.

## Deployment

* Login to your Cloudflare account

```sh
npx wrangler login
```

* Deploy the worker 

```sh
npx wrangler deploy
```

* Configure secrets if you have not done so already.

```sh
npx wrangler secret put STADTGESTALTEN_URL
npx wrangler secret put STADTGESTALTEN_GROUP_SLUG
npx wrangler secret put MASTODON_URL
npx wrangler secret put MASTODON_TOKEN
npx wrangler secret put MASTODON_ACCOUNT
npx wrangler secret put MASTODON_HASHTAGS
```

## Local Testing
Start the dev server:
```sh
npx wrangler dev --test-scheduled
```
And visit `http://127.0.0.1:8787/__scheduled?cron=*+*+*+*+*` in the browser.

## Known Limitations

The worker currently scans all toots in the target account to find out which 
events it has already published. This is not scalable for accounts with a
large amount of toots.