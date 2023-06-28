import { Env } from "./worker"

const DEFAULT_URL = "https://stadtgestalten.org";

export const stadtGestaltenUrl = (env: Env) => env.STADTGESTALTEN_URL ?? DEFAULT_URL;