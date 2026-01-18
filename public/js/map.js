mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: coordinates,
  zoom: 10
});

const popup = new mapboxgl.Popup({ offset: 25 })
  .setHTML(popupHTML);

new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(popup)
  .addTo(map);
