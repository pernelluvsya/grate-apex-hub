// Where the /api functions live. On the deployed site it's the same address (""). When the app runs
// on your own computer there is no /api, so it talks to the deployed site instead (CORS is allowed).
const env = process.env.EXPO_PUBLIC_API_BASE;
const local = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location?.hostname ?? "");
export const API_BASE: string = env || (local ? "https://grate-apex-hub.vercel.app" : "");
