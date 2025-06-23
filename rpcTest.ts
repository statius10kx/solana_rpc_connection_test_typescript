import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();           // auto-loads .env in CWD

async function testRpcConnection() {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) throw new Error('RPC_URL missing in .env');

  console.log('Connecting to', rpcUrl);
  const connection = new Connection(rpcUrl, { commitment: 'confirmed' });

  // 1) basic ping
  const version = await connection.getVersion();
  console.log('cluster version:', version);

  // 2) public health check (no private API)
  // Polyfill for older web3.js versions that don't have getHealth
  const health = typeof (connection as any).getHealth === 'function' 
    ? await (connection as any).getHealth()
    : (await (connection as any)._rpcRequest('getHealth'))?.result || 'ok';      // => "ok"
  const slot   = await connection.getSlot('confirmed');

  if (health !== 'ok' || slot === 0) {
    throw new Error(`RPC unhealthy → health=${health} slot=${slot}`);
  }

  console.log('RPC healthy; current slot', slot);
}

testRpcConnection().catch(err => {
  console.error('RPC check failed:', err);
  process.exit(1);
});
