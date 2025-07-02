// Netlify function for attendance API
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Simple login endpoint for testing
    if (path === '/api/auth/login' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      
      // Simple hardcoded auth for testing
      if (body.username === 'admin' && body.password === 'admin123') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            token: 'test-token-' + Date.now(),
            user: {
              id: 1,
              username: 'admin',
              role: 'admin',
              first_name: 'Admin',
              last_name: 'User'
            }
          })
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }
    }

    // For other endpoints, return a test response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Netlify backup API active',
        path: path,
        method: event.httpMethod 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
}; 