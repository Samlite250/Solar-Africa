async function testAPI() {
  try {
    console.log('Testing Registration...');
    const email = `solar_test_${Math.floor(Math.random()*1000)}@gmail.com`;
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: email,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    console.log('Registration Status:', regRes.status);
    console.log('Registration Response:', regData);

    if (regRes.ok) {
        console.log('Testing Login...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: 'password123'
          })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginData);
    }
  } catch (err) {
    console.error('API Test Error:', err.message);
  }
}

testAPI();
