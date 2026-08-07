import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  return rss({
    title: 'The Mills Lab',
    description: 'News from the Mills Lab at the University of Michigan.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        link: post.data.externalUrl || `/news/${post.id}/`,
      })),
  });
}
