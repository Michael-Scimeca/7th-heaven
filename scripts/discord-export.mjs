// Export Discord channel / forum history via the official Discord REST API (bot token).
//
// Usage:
//   node --env-file=.env.local scripts/discord-export.mjs <channelId> [<channelId> ...]
//
// Requires DISCORD_BOT_TOKEN in the env. The bot must be in the server with
// "View Channel" + "Read Message History", and "Message Content Intent" must be
// enabled in the Developer Portal (Bot tab) or message text comes back empty.
//
// Output: data/discord-export/<channelId>.json and .txt (txt is the readable transcript).

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://discord.com/api/v10';
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const OUT_DIR = path.resolve('data/discord-export');
const FORUM = 15;
const MEDIA = 16;

if (!TOKEN) {
  console.error('Missing DISCORD_BOT_TOKEN (add it to .env.local).');
  process.exit(1);
}

const channelIds = process.argv.slice(2);
if (!channelIds.length) {
  console.error('Usage: node --env-file=.env.local scripts/discord-export.mjs <channelId> [...]');
  process.exit(1);
}

async function api(route) {
  for (;;) {
    const res = await fetch(`${API}${route}`, {
      headers: { Authorization: `Bot ${TOKEN}` },
    });
    if (res.status === 429) {
      const { retry_after = 1 } = await res.json();
      await new Promise((r) => setTimeout(r, retry_after * 1000 + 250));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${route}: ${await res.text()}`);
    return res.json();
  }
}

async function fetchAllMessages(channelId) {
  const all = [];
  let before;
  for (;;) {
    const qs = new URLSearchParams({ limit: '100', ...(before && { before }) });
    const batch = await api(`/channels/${channelId}/messages?${qs}`);
    if (!batch.length) break;
    all.push(...batch);
    before = batch[batch.length - 1].id;
    process.stdout.write(`\r  ${all.length} messages`);
  }
  process.stdout.write('\n');
  return all.reverse().map((m) => ({
    id: m.id,
    timestamp: m.timestamp,
    author: m.author?.global_name || m.author?.username,
    authorId: m.author?.id,
    bot: !!m.author?.bot,
    content: m.content,
    replyTo: m.message_reference?.message_id ?? null,
    attachments: (m.attachments || []).map((a) => a.url),
    reactions: (m.reactions || []).map((r) => ({ emoji: r.emoji.name, count: r.count })),
  }));
}

async function fetchForumThreads(channel) {
  const threads = new Map();
  const { threads: active } = await api(`/guilds/${channel.guild_id}/threads/active`);
  active.filter((t) => t.parent_id === channel.id).forEach((t) => threads.set(t.id, t));

  let before;
  for (;;) {
    const qs = new URLSearchParams({ limit: '100', ...(before && { before }) });
    const page = await api(`/channels/${channel.id}/threads/archived/public?${qs}`);
    page.threads.forEach((t) => threads.set(t.id, t));
    if (!page.has_more || !page.threads.length) break;
    before = page.threads[page.threads.length - 1].thread_metadata.archive_timestamp;
  }
  return [...threads.values()];
}

function toTranscript(title, messages) {
  const lines = [`# ${title}`, ''];
  for (const m of messages) {
    const extra = m.attachments.length ? ` [${m.attachments.length} attachment(s)]` : '';
    lines.push(`[${m.timestamp.slice(0, 16).replace('T', ' ')}] ${m.author}: ${m.content}${extra}`);
  }
  return lines.join('\n');
}

await mkdir(OUT_DIR, { recursive: true });

for (const id of channelIds) {
  const channel = await api(`/channels/${id}`);
  console.log(`#${channel.name} (${id})`);

  let result;
  let transcript;
  if (channel.type === FORUM || channel.type === MEDIA) {
    const threads = await fetchForumThreads(channel);
    console.log(`  forum with ${threads.length} posts`);
    result = { channel: channel.name, type: 'forum', posts: [] };
    const parts = [];
    for (const t of threads) {
      console.log(`  post: ${t.name}`);
      const messages = await fetchAllMessages(t.id);
      result.posts.push({ id: t.id, title: t.name, messages });
      parts.push(toTranscript(t.name, messages));
    }
    transcript = parts.join('\n\n');
  } else {
    const messages = await fetchAllMessages(id);
    result = { channel: channel.name, type: 'text', messages };
    transcript = toTranscript(`#${channel.name}`, messages);
  }

  await writeFile(path.join(OUT_DIR, `${id}.json`), JSON.stringify(result, null, 2));
  await writeFile(path.join(OUT_DIR, `${id}.txt`), transcript);
  console.log(`  saved data/discord-export/${id}.{json,txt}`);
}
