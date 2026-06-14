const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

async function testAvatarUpload() {
  console.log('--- DIAGNOSING AVATAR UPLOAD ---');
  let token = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'tester_sprint5@healthplate.com',
      password: 'password123'
    });
    token = loginRes.data.data.session.access_token;
    console.log('✅ Logged in successfully.');
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  console.log('\nUploading avatar with field name "avatar"...');
  try {
    const formData = new FormData();
    const fileBlob = new Blob([TINY_PNG], { type: 'image/png' });
    formData.append('avatar', fileBlob, 'avatar.png');

    const res = await axios.post(`${BASE_URL}/upload/avatar`, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('✅ Success:', res.status, res.data);
  } catch (err) {
    console.error('❌ Failed:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }
}

testAvatarUpload();
