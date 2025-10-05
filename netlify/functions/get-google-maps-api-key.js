exports.handler = async function() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify({ key: apiKey || '' })
  };
};
