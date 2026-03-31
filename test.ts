import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'test1', pluginId: 'connection.shopware.app_oauth', name: 'Test Profile', data: { profileName: 'Test Profile' } })
    });
    console.log('POST status:', res.status);
    const text = await res.text();
    console.log('POST response:', text);

    const getRes = await fetch('http://localhost:3000/api/profiles');
    console.log('GET status:', getRes.status);
    const getText = await getRes.text();
    console.log('GET response:', getText);
  } catch (e) {
    console.error(e);
  }
}

test();
