// Import 'express' and 'lodash' modules
const express = require('express');
const l1= require('lodash');

// Import 'node-fetch' using dynamic import
import('node-fetch').then(fetch => {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON request bodies
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Welcome to the Blog API!');
  });

  app.get('/api/blog-stats', async (req, res) => {
    try {
      const options = {
        method: 'GET',
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      };
  
      // Fetch blog data
      const response = await fetch.default('https://intent-kit-16.hasura.app/api/rest/blogs', options);
      const blogs = await response.json();
  
      // Handle empty or undefined response
      if (!Array.isArray(blogs) || blogs.length === 0) {
        return res.status(404).json({ error: 'No blogs found' });
      }
  
      // Data analysis with Lodash
      const blogsWithTitles = blogs.filter(blog => blog.title && blog.title.length > 0);
      
      const totalBlogs = blogsWithTitles.length;
      const longestTitleObj = l1.maxBy(blogsWithTitles, blog => blog.title.length);
      const longestTitle = longestTitleObj ? longestTitleObj.title : '';
      const privacyBlogs = l1.filter(blogsWithTitles, blog => l1.includes(l1.toLower(blog.title), 'privacy'));
      const uniqueTitles = l1.uniqBy(blogsWithTitles, 'title').map(blog => blog.title);
  
      // Respond with JSON object containing statistics
      res.json({
        totalBlogs,
        longestTitle,
        privacyBlogs: privacyBlogs.length,
        uniqueTitles
      });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/api/blog-search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is missing' });
    }

    try {
      const options = {
        method: 'GET',
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      };

      // Fetch blog data
      const response = await fetch.default('https://intent-kit-16.hasura.app/api/rest/blogs', options);
      const blogs = await response.json();

      // Perform search
      const searchResults = blogs.filter(blog => blog.title.toLowerCase().includes(query.toLowerCase()));

      // Respond with JSON object containing search results
      res.json(searchResults);
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error(error);
});
