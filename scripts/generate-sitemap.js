// Script to generate sitemap.xml with all blog posts from Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dqjcbwjqrenubdzalicy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxamNid2pxcmVudWJkemFsaWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE0MjcsImV4cCI6MjA3OTUwNzQyN30.KxH3diGoF-tkwLdPdPuxC5yQ8Rjpr2grV4VgGNUk5Vo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
    try {
        console.log('🔍 Fetching blog posts from Supabase...');

        // Fetch all published blog posts
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('slug, updated_at, published_at')
            .eq('published', true)
            .order('published_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching posts:', error);
            throw error;
        }

        console.log(`✅ Found ${posts?.length || 0} published blog posts`);

        const today = new Date().toISOString().split('T')[0];

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://xzenpress.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Pages -->
  <url>
    <loc>https://xzenpress.com/breathing</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/acupressure</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/sounds</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/premium</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/corporate</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Blog Posts -->
${posts?.map(post => `  <url>
    <loc>https://xzenpress.com/blog/${post.slug}</loc>
    <lastmod>${(post.updated_at || post.published_at)?.split('T')[0] || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n') || ''}
</urlset>`;

        // Write to public/sitemap.xml
        const publicDir = path.join(process.cwd(), 'public');
        const sitemapPath = path.join(publicDir, 'sitemap.xml');

        fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

        console.log(`✅ Sitemap generated successfully!`);
        console.log(`📄 Total URLs: ${7 + (posts?.length || 0)}`);
        console.log(`📍 Location: ${sitemapPath}`);
        console.log(`\n🌐 Sitemap URL: https://xzenpress.com/sitemap.xml`);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
