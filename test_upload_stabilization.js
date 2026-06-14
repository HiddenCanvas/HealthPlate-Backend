const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// 1x1 png & jpeg dummy buffers
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const TINY_JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
const LARGE_DUMMY_JPG = Buffer.alloc(6 * 1024 * 1024, 0xFF);

async function runTests() {
  console.log('=== SPRINT BF-1A: MEDIA UPLOAD & AI ENDPOINT STABILIZATION TESTING ===\n');

  // 1. Authenticate user
  let token = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'tester_sprint5@healthplate.com',
      password: 'password123'
    });
    token = loginRes.data.data.session.access_token;
    console.log('✅ Logged in successfully. Token obtained.');
  } catch (err) {
    console.error('❌ Login failed (ensure the server is running on port 3000):', err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Test Case 1: Avatar upload with field name "avatar"
  console.log('\n--- Test 1: Upload avatar with field name "avatar" ---');
  try {
    const formData = new FormData();
    const fileBlob = new Blob([TINY_PNG], { type: 'image/png' });
    formData.append('avatar', fileBlob, 'test_avatar.png');

    const res = await axios.post(`${BASE_URL}/upload/avatar`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    console.log('Status:', res.status, '(Expected: 200)');
    console.log('Response data:', res.data);
    if (res.status === 200 && res.data.success && res.data.data.avatar_url) {
      console.log('✅ PASSED: Upload succeeded with field name "avatar".');
    } else {
      console.error('❌ FAILED: Response mismatch.');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }

  // Test Case 2: Avatar upload with field name "image"
  console.log('\n--- Test 2: Upload avatar with field name "image" ---');
  try {
    const formData = new FormData();
    const fileBlob = new Blob([TINY_PNG], { type: 'image/png' });
    formData.append('image', fileBlob, 'test_avatar.png');

    const res = await axios.post(`${BASE_URL}/upload/avatar`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    console.log('Status:', res.status, '(Expected: 200)');
    if (res.status === 200 && res.data.success) {
      console.log('✅ PASSED: Upload succeeded with field name "image".');
    } else {
      console.error('❌ FAILED: Response mismatch.');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }

  // Test Case 3: Avatar upload with non-image format
  console.log('\n--- Test 3: Upload avatar with non-image format ---');
  try {
    const formData = new FormData();
    const textBlob = new Blob(['Plain text file content'], { type: 'text/plain' });
    formData.append('image', textBlob, 'test_doc.txt');

    await axios.post(`${BASE_URL}/upload/avatar`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    console.error('❌ FAILED: Allowed non-image file format');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASSED: Returned HTTP 400 Bad Request.', err.response.data);
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 4: Avatar upload with file size exceeding limit (>5MB)
  console.log('\n--- Test 4: Upload avatar with file size > 5 MB ---');
  try {
    const formData = new FormData();
    const largeBlob = new Blob([LARGE_DUMMY_JPG], { type: 'image/jpeg' });
    formData.append('image', largeBlob, 'large_file.jpg');

    await axios.post(`${BASE_URL}/upload/avatar`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    console.error('❌ FAILED: Allowed upload greater than 5 MB');
  } catch (err) {
    if (err.response && err.response.status === 413) {
      console.log('✅ PASSED: Returned HTTP 413 Payload Too Large.');
    } else {
      console.error('❌ FAILED: Unexpected status:', err.response?.status, err.message);
    }
  }

  // Test Case 5: AI predict food with "image/jpg" mime type and file extension ".jpg"
  console.log('\n--- Test 5: AI predict food with Android image/jpg MIME type ---');
  try {
    const formData = new FormData();
    // Simulate Android camera JPG upload with image/jpg mime type
    const imgBlob = new Blob([TINY_JPG], { type: 'image/jpg' });
    formData.append('image', imgBlob, 'android_cam.jpg');
    formData.append('description', 'Ayam Bakar');

    const res = await axios.post(`${BASE_URL}/ai/predict-food`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    console.log('Status:', res.status, '(Expected: 200)');
    if (res.status === 200 && res.data.success) {
      console.log('✅ PASSED: AI food prediction accepted image/jpg format successfully.');
      console.log('AI Prediction result name:', res.data.data.food_name);
    } else {
      console.error('❌ FAILED: Response mismatch.');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }

  // Test Case 6: AI predict food with generic MIME type "application/octet-stream" but file extension ".jpg" (Android Gallery fallback)
  console.log('\n--- Test 6: AI predict food with Android generic application/octet-stream MIME + .jpg extension ---');
  try {
    const formData = new FormData();
    const imgBlob = new Blob([TINY_JPG], { type: 'application/octet-stream' });
    formData.append('image', imgBlob, 'android_gallery.jpg');
    formData.append('description', 'Ayam Bakar');

    const res = await axios.post(`${BASE_URL}/ai/predict-food`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
    console.log('Status:', res.status, '(Expected: 200)');
    if (res.status === 200 && res.data.success) {
      console.log('✅ PASSED: AI food prediction bypassed MIME check and validated successfully using file extension fallback.');
    } else {
      console.error('❌ FAILED: Response mismatch.');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }
}

runTests();
