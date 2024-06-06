    mapboxgl.accessToken = "pk.eyJ1Ijoic2hyZXlhbnNodmVybWExNSIsImEiOiJjbHgwYXJkOXQwMzRwMnFzOGhpNGo2OXc1In0.o_a9-lsEqayIVU99A7cg_w";
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]
        zoom: 9 // starting zoom
    });


    const marker1 = new mapboxgl.Marker({color: "red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.location}</h4><p>Exact location provided after booking</p>`))
    .addTo(map);