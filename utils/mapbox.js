const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({
  accessToken: mapToken,
});

module.exports = geocoder;
