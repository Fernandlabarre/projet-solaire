const axios = require('axios');

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const { data } = await axios.get(url, { headers: { 'User-Agent': 'carteprojet/1.0' } });
  if (data && data.length > 0) {
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
  }
  return null;
}

module.exports = { geocodeAddress };
