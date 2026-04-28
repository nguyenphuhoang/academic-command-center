import path from "path";
import fs from "fs";

// Load environment variables from the parent directory (root .env)
const envPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        acc[key.trim()] = values.join('=').trim().replace(/^['"]|['"]$/g, '');
      }
      return acc;
    }, {});

  for (const k in envConfig) {
    if (!process.env[k]) {
      process.env[k] = envConfig[k];
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
};

export default nextConfig;
