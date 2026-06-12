// Allows TypeScript to accept CSS imports as side-effects
// e.g. import 'leaflet/dist/leaflet.css'
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
