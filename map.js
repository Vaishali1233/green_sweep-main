// map.js
const map = L.map('map').setView([0, 0], 2); // Set the initial view (latitude, longitude, zoom)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to add a marker on the map
function addMarker(latitude, longitude) {
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Location tagged!').openPopup();
}
