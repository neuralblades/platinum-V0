'use client';

import React, { useState, useEffect, Usable } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getBlogPostBySlug, getBlogImageUrl, addBlogComment, BlogPost } from '@/services/blogService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';

interface BlogPostDetailClientProps {
  slug: string;
}

const BlogPostDetailClient: React.FC<BlogPostDetailClientProps> = ({ slug }) => {
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        try {
          const response = await getBlogPostBySlug(slug);
          if (response && response.post) {
            setPost(response.post);
            setError(null);
          } else {
            setPost(null);
            setError('Blog post not found');
          }
        } catch (err) {
          console.error(`Error fetching blog post with slug ${slug}:`, err);
          setPost(null);
          setError('Failed to load blog post. The blog feature might not be fully set up yet.');
        }
      } catch (err) {
        console.error('Error in blog post detail component:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentError('You must be logged in to comment');
      return;
    }

    if (!commentContent.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError(null);

      await addBlogComment(post!.id, commentContent);

      setCommentContent('');
      setCommentSuccess(true);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setCommentSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setCommentError('Failed to submit comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <motion.div
            className="h-8 w-3/4 rounded bg-gray-200"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div
            className="h-64 rounded-lg bg-gray-200"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
          />
          <div className="space-y-4">
            <motion.div
              className="h-4 rounded bg-gray-200"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
            />
            <motion.div
              className="h-4 rounded bg-gray-200"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.4 }}
            />
            <motion.div
              className="h-4 w-5/6 rounded bg-gray-200"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <FadeInUp>
          <motion.div
            className="rounded-lg bg-gray-100 p-6 text-center text-gray-800"
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              className="mb-2 text-xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Article Not Found
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The blog post you&apos;re looking for is not available.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/blog"
                className="mt-4 inline-block rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-900"
              >
                Back to Blog
              </Link>
            </motion.div>
          </motion.div>
        </FadeInUp>
      </div>
    );
  }

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
              { label: 'Blog', href: '/blog' },
              { label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` },
              { label: post.title }
            ]}
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.article
              className="overflow-hidden rounded-xl bg-white shadow-md"
              whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Featured Image */}
              <motion.div
                className="relative h-96 w-full"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src={getBlogImageUrl(post.featuredImage)}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                />
              </motion.div>

              {/* Article Content */}
              <div className="p-8">
                {/* Category and Date */}
                <motion.div
                  className="mb-4 flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/blog?category=${encodeURIComponent(post.category)}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
                    >
                      {post.category}
                    </Link>
                  </motion.div>
                  <motion.time
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {formatDate(post.publishedAt || post.createdAt)}
                  </motion.time>
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {post.title}
                </motion.h1>

                {/* Content */}
                <motion.div
                  className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                  style={{
                    display: 'block',
                    lineHeight: '1.8',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {post.content}
                </motion.div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <motion.div
                    className="mt-8 border-t border-gray-100 pt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <motion.h3
                      className="mb-3 text-lg font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      Tags
                    </motion.h3>
                    <StaggerContainer className="flex flex-wrap gap-2" delay={0.05}>
                      {post.tags.map((tag) => (
                        <StaggerItem key={tag}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              href={`/blog?tag=${encodeURIComponent(tag)}`}
                              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                            >
                              {tag}
                            </Link>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </motion.div>
                )}

                {/* Share Button */}
                <motion.div
                  className="mt-8 border-t border-gray-100 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.h3
                    className="mb-3 text-lg font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    Share This Article
                  </motion.h3>
                  <motion.button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.title,
                          url: window.location.href,
                        }).catch(err => console.error('Error sharing:', err));
                      } else {
                        // Fallback for browsers that don't support navigator.share
                        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`;
                        window.open(shareUrl, '_blank');
                      }
                    }}
                    className="flex items-center rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-900"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      className="mr-2 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: [0, 15, 0, -15, 0] }}
                      transition={{ duration: 1, delay: 1, repeat: 1 }}
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </motion.svg>
                    Share
                  </motion.button>
                </motion.div>
              </div>
            </motion.article>

            {/* Comments Section */}
            <motion.div
              className="mt-8 rounded-xl bg-white p-8 shadow-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <motion.h2
                className="mb-6 text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Comments
              </motion.h2>

              {/* Comment Form */}
              {isAuthenticated ? (
                <motion.form
                  onSubmit={handleCommentSubmit}
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <div className="mb-4">
                    <motion.label
                      htmlFor="comment"
                      className="mb-2 block font-medium text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1 }}
                    >
                      Leave a Comment
                    </motion.label>
                    <motion.textarea
                      id="comment"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="Share your thoughts..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 1.1 }}
                      whileFocus={{ boxShadow: "0 0 0 3px rgba(156, 163, 175, 0.2)" }}
                    ></motion.textarea>
                  </div>

                  <AnimatePresence>
                    {commentError && (
                      <motion.div
                        className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {commentError}
                      </motion.div>
                    )}

                    {commentSuccess && (
                      <motion.div
                        className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Your comment has been submitted and is pending approval.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-900 disabled:opacity-70"
                    disabled={commentSubmitting}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {commentSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  className="mb-8 rounded-md bg-gray-50 p-4 text-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <p>
                    Please{' '}
                    <motion.span whileHover={{ scale: 1.05 }}>
                      <Link href="/login" className="font-medium text-gray-600 underline">
                        log in
                      </Link>
                    </motion.span>{' '}
                    to leave a comment.
                  </p>
                </motion.div>
              )}

              {/* Comments List */}
              {post.comments && post.comments.length > 0 ? (
                <StaggerContainer className="space-y-6" delay={0.1}>
                  {post.comments.map((comment) => (
                    <StaggerItem key={comment.id}>
                      <motion.div
                        className="rounded-lg bg-gray-50 p-4"
                        whileHover={{ backgroundColor: "#F9FAFB", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-2 flex items-center">
                          <motion.div
                            className="relative mr-3 h-8 w-8 overflow-hidden rounded-full"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Image
                              src={comment.user?.avatar || '/images/default-avatar.png'}
                              alt={comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </motion.div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  No comments yet. Be the first to comment!
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <BlogSidebar />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Server component that passes the slug to the client component
export default function BlogPostDetailPage({ params }: { params: Usable<{ slug: string }> }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;
  return <BlogPostDetailClient slug={slug} />;
}
