// Font used for the 3D text (the placeholder "S" and the orbiting text ring).
//
// A local Poppins file keeps the preloader self-contained (important for the
// drop-in widget build). If this file is missing at runtime, troika-three-text
// falls back to its bundled default font, so the scene still renders.
//
// When you send the real "S" logo SVG, the Emblem can switch from this text "S"
// to your SVG without touching this file.
// BASE_URL is "/" in dev and "/testingpreload/" in the Pages build, so the font
// resolves correctly in both.
export const FONT = `${import.meta.env.BASE_URL}fonts/Poppins-SemiBold.ttf`
