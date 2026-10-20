import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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
