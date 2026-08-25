import Mapbox from '@rnmapbox/maps';

// Public, client-safe token. Never put a Mapbox secret (sk.*) token in the app.
export const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoidWdvbGYiLCJhIjoiY21yZWlmZTBqMHB2MTMwcHZoZ2psZnNqeSJ9.oZIm562p4GWa7AdNqrY1Cg';

export const MAPBOX_STYLE_URL =
  'mapbox://styles/mapbox/satellite-streets-v12';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
