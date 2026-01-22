import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import styles from "./page.module.css";

interface BlogWithAuthor {
  _id: string | { toString(): string };
  title: string;
  slug: string;
  location?: string;
  travelType?: string;
  images?: string[];
  createdAt: Date | string;
  author?: { name: string; email?: string; avatar?: string } | string;
}

async function getBlogs(): Promise<BlogWithAuthor[]> {
  await dbConnect();
  const blogs = await Blog.find({ privacy: "public", approved: true })
    .sort({ createdAt: -1 })
    .limit(12)
    .select("title slug location travelType privacy createdAt author images")
    .populate("author", "name email avatar")
    .lean();

  return blogs as unknown as BlogWithAuthor[];
}

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.badge}>Travel Blog Platform</p>
          <h1 className={styles.heading}>
            Your Journey, Uniquely Told
          </h1>
          <p className={styles.subtitle}>
            Discover amazing travel stories, connect with travelers, and share your own adventures with the world.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/dashboard">
              Create Blog
            </Link>
            <Link className={styles.secondary} href="/blogs">
              Explore All
            </Link>
          </div>
        </div>
        <div className={styles.heroCard}>
          <h3>Start Your Journey</h3>
          <p className={styles.muted}>
            Share your travel experiences, connect with fellow travelers, and monetize your expertise through paid conversations.
          </p>
        </div>
      </header>

      <section className={styles.blogsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Latest Travel Stories</h2>
          <Link href="/blogs" className={styles.viewAll}>
            View All →
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className={styles.empty}>
            <p>No blogs yet. Be the first to share your travel story!</p>
            <Link href="/dashboard" className={styles.primary}>
              Create Your First Blog
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.blogsGrid}>
              {blogs.map((blog: BlogWithAuthor) => {
                const author = blog.author && typeof blog.author === 'object' && 'name' in blog.author 
                  ? blog.author as { name: string; email?: string; avatar?: string }
                  : null;
                const blogId = String(blog._id);
                
                return (
                  <Link
                    key={blogId}
                    href={`/blogs/${blogId}`}
                    className={styles.blogCard}
                  >
                    {blog.images && blog.images.length > 0 ? (
                      <div className={styles.imageContainer}>
                        <Image
                          src={blog.images[0]}
                          alt={blog.title}
                          fill
                          className={styles.blogImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span>✈️</span>
                      </div>
                    )}
                    <div className={styles.blogContent}>
                      <div className={styles.blogMeta}>
                        <span className={styles.travelType}>
                          {blog.travelType || "travel"}
                        </span>
                        {blog.location && (
                          <span className={styles.location}>📍 {blog.location}</span>
                        )}
                      </div>
                      <h3 className={styles.blogTitle}>{blog.title}</h3>
                      <div className={styles.blogFooter}>
                        <div className={styles.authorInfo}>
                          {author?.avatar ? (
                            <Image
                              src={author.avatar}
                              alt={author.name}
                              width={20}
                              height={20}
                              className={styles.authorAvatar}
                            />
                          ) : (
                            <div className={styles.authorAvatarPlaceholder}>
                              {author?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <span className={styles.authorName}>
                            {author?.name || "Anonymous"}
                          </span>
                        </div>
                        <span className={styles.publishDate}>
                          {new Date(blog.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {blogs.length >= 12 && (
              <div className={styles.loadMore}>
                <Link href="/blogs" className={styles.viewAllButton}>
                  View All Blogs →
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Why Jyurniq?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✍️</div>
            <h3>Share Your Story</h3>
            <p>Create beautiful travel blogs with images, rich content, and location tags.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>
            <h3>Monetize Your Expertise</h3>
            <p>Earn from paid questions and 1:1 conversations with fellow travelers.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>Embed Anywhere</h3>
            <p>Share your blogs on any website with our embed code feature.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3>Engage & Connect</h3>
            <p>Build a community through comments, replies, and direct messaging.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
