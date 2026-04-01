import { useState } from 'react';
import './Blog.css';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Smart Home Electrical Systems',
      excerpt: 'Discover how smart electrical systems are revolutionizing home automation and energy efficiency.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      category: 'Technology',
      date: '2024-03-30',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Solar Power Solutions for Modern Homes',
      excerpt: 'Learn about the latest solar charge controllers and batteries for sustainable energy.',
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop',
      category: 'Solar',
      date: '2024-03-28',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Electrical Safety: Circuit Breakers and RCDs',
      excerpt: 'Understanding the importance of circuit breakers and residual current devices.',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop',
      category: 'Safety',
      date: '2024-03-25',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'LED Lighting: Energy Efficiency and Cost Savings',
      excerpt: 'How LED technology is transforming lighting solutions and reducing energy costs.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      category: 'Lighting',
      date: '2024-03-22',
      readTime: '4 min read'
    }
  ];

  const categories = ['all', 'Technology', 'Solar', 'Safety', 'Lighting'];

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Electrical Solutions Blog</h1>
        <p>Stay updated with the latest trends in electrical technology, safety, and innovation</p>
      </div>

      <div className="blog-categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Posts' : category}
          </button>
        ))}
      </div>

      <div className="blog-grid">
        {filteredPosts.map(post => (
          <article key={post.id} className="blog-card">
            <div className="blog-image">
              <img src={post.image} alt={post.title} />
              <span className="category-tag">{post.category}</span>
            </div>
            <div className="blog-content">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-meta">
                <span className="date">{post.date}</span>
                <span className="read-time">{post.readTime}</span>
              </div>
              <button className="read-more-btn">Read More</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;