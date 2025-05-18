'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getBlogPosts, BlogPost, BlogFilter } from '@/services/blogService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { motion } from 'framer-motion';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';

const BlogPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  // Get filter params from URL
  const category = searchParams.get('category') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const filters: BlogFilter = {
          page,
          limit: 9,
          category,
          tag,
          search,
          status: 'published'
        };

        try {
          const response = await getBlogPosts(filters);

          setPosts(response.posts || []);
          setTotalPages(response.totalPages || 1);
          setCurrentPage(response.currentPage || 1);
          setHasMore(response.hasMore || false);
          setTotalPosts(response.count || 0);
          setError(null);
        } catch (err) {
          console.error('Error fetching blog posts:', err);
          // Set default values
          setPosts([]);
          setTotalPages(1);
          setCurrentPage(1);
          setHasMore(false);
          setTotalPosts(0);
          setError('Failed to load blog posts. The blog feature might not be fully set up yet.');
        }
      } catch (err) {
        console.error('Error in blog page component:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, category, tag, search]);

  // Generate pagination links
  const getPaginationLinks = () => {
    const links = [];
    const maxVisiblePages = 5;

    // Calculate range of visible page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous page link
    if (currentPage > 1) {
      links.push(
        <Link
          key="prev"
          href={`/blog?page=${currentPage - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      );
    }

    // Page number links
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <Link
          key={i}
          href={`/blog?page=${i}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className={`flex h-10 w-10 items-center justify-center rounded-md ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </Link>
      );
    }

    // Next page link
    if (hasMore) {
      links.push(
        <Link
          key="next"
          href={`/blog?page=${currentPage + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      );
    }

    return links;
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog' },
              ...(category ? [{ label: `Category: ${category}` }] : []),
              ...(tag ? [{ label: `Tag: ${tag}` }] : []),
              ...(search ? [{ label: `Search: ${search}` }] : [])
            ]}
          />
        </motion.div>

        {/* Page Title */}
        <FadeInUp className="mb-10">
          <motion.h1
            className="text-4xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {category ? `${category} Articles` :
             tag ? `Articles Tagged "${tag}"` :
             search ? `Search Results for "${search}"` :
             'Our Blog'}
          </motion.h1>
          <motion.p
            className="mt-2 text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {category ? `Browse our latest articles in the ${category} category` :
             tag ? `Browse articles related to ${tag}` :
             search ? `Found ${totalPosts} articles matching your search` :
             'Insights, tips, and news from the real estate world'}
          </motion.p>
        </FadeInUp>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="h-80 rounded-xl bg-gray-200"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  />
                ))}
              </div>
            ) : error ? (
              <FadeInUp>
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  <p>{error}</p>
                </div>
              </FadeInUp>
            ) : posts.length === 0 ? (
              <FadeInUp>
                <motion.div
                  className="rounded-lg bg-white p-8 text-center shadow-md"
                  whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h3
                    className="mb-2 text-xl font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    No Articles Found
                  </motion.h3>
                  <motion.p
                    className="mb-4 text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {search
                      ? `We couldn't find any articles matching "${search}"`
                      : category
                      ? `No articles found in the ${category} category`
                      : tag
                      ? `No articles found with the tag "${tag}"`
                      : 'No articles have been published yet'}
                  </motion.p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/blog"
                      className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      View All Articles
                    </Link>
                  </motion.div>
                </motion.div>
              </FadeInUp>
            ) : (
              <>
                <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" delay={0.1}>
                  {posts.map((post) => (
                    <StaggerItem key={post.id}>
                      <motion.div
                        whileHover={{
                          y: -10,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <BlogCard post={post} />
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    className="mt-10 flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="flex space-x-2">
                      {getPaginationLinks()}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BlogSidebar currentCategory={category} currentTag={tag} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
