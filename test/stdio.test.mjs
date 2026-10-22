import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { startSseServer } from '../src/index.js';

test('a real stdio client lists tools and reads projects against a local API fixture', async () => {
  const requests = [];
  const api = createServer((req, res) => {
    requests.push({ path: req.url, method: req.method, authorized: req.headers['x-api-key'] === 'offline-fixture-only' });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, projects: [{ id: 'fixture-project', name: 'Offline fixture' }] }));
  });
  await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
  const transport = new StdioClientTransport({
    command: process.execPath, args: ['bin/cli.js'],
    env: { PATH: process.env.PATH, REELING_API_KEY: 'offline-fixture-only', REELING_API_URL: `http://127.0.0.1:${api.address().port}` },
    stderr: 'pipe',
  });
  const client = new Client({ name: 'reeling-offline-test', version: '1.0.0' });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.ok(tools.length >= 10);
    assert.equal(new Set(tools.map(t => t.name)).size, tools.length);
    for (const tool of tools) assert.equal(tool.inputSchema.type, 'object');
    assert.ok(tools.some(t => t.name === 'reeling_publish_post'));
    const result = await client.callTool({ name: 'reeling_list_projects', arguments: {} });
    assert.equal(result.isError, undefined);
    assert.equal(JSON.parse(result.content[0].text).projects[0].name, 'Offline fixture');
    assert.deepEqual(requests, [{ path: '/api/v1/projects', method: 'GET', authorized: true }]);
  } finally { await client.close(); await new Promise(resolve => api.close(resolve)); }
});

test('HTTP discovery and health report the release version without executing a tool', async () => {
  const server = await startSseServer(0, '127.0.0.1');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await (await fetch(base + '/health')).json();
    assert.equal(health.version, '1.1.0');
    const response = await fetch(base + '/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'offline-test', version: '1.0.0' } } }) });
    const data = await response.json();
    assert.equal(data.result.serverInfo.version, health.version);
    const install = await (await fetch(base + '/install')).text();
    assert.match(install, /github:yomariano\/reeling-mcp#v1\.1\.0/);

    const spamRpc = await fetch(base + '/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'reeling_check_spam_score',
          arguments: {
            platform: 'reddit',
            title: 'FREE GUIDE to our tool',
            content: 'Check out https://bit.ly/test?utm_source=reddit and upvote if useful!'
          }
        }
      })
    });
    const spamData = await spamRpc.json();
    const spamResult = JSON.parse(spamData.result.content[0].text);
    assert.ok(spamResult.safety_score < 50);
    assert.ok(spamResult.triggers.some(t => t.id === 'url_shortener'));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
