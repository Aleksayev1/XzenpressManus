import { supabase } from '../lib/supabase';

export async function GET() {
    try {
        // Fetch all published blog posts
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('slug, updated_at, published_at')
            .eq('published', true)
            .order('published_at', { ascending: false });

        if (error) throw error;

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://xzenpress.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Pages -->
  <url>
    <loc>https://xzenpress.com/breathing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/acupressure</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/sounds</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/premium</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://xzenpress.com/corporate</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Blog Posts -->
${posts?.map(post => `  <url>
    <loc>https://xzenpress.com/blog/${post.slug}</loc>
    <lastmod>${(post.updated_at || post.published_at).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n') || ''}
</urlset>`;

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600'
            }
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
}
