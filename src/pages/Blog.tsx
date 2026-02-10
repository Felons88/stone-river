import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const articles = [
    {
      id: 1,
      title: "What Can and Cannot Be Recycled in Minnesota",
      slug: "what-can-be-recycled-minnesota",
      category: "recycling",
      excerpt: "A comprehensive guide to recycling in Minnesota. Learn what items can be recycled, what should go to special facilities, and what belongs in the trash.",
      image: "/placeholder.svg",
      author: "StoneRiver Team",
      date: "January 15, 2026",
      readTime: "5 min read",
      tags: ["Recycling", "Minnesota", "Environment"]
    },
    {
      id: 2,
      title: "How to Prepare for Junk Removal Day",
      slug: "prepare-for-junk-removal",
      category: "tips",
      excerpt: "Make your junk removal appointment go smoothly with these preparation tips. From sorting items to clearing pathways, we cover everything you need to know.",
      image: "/placeholder.svg",
      author: "StoneRiver Team",
      date: "January 10, 2026",
      readTime: "4 min read",
      tags: ["Tips", "Preparation", "Junk Removal"]
    },
    {
      id: 3,
      title: "Decluttering Your Home: Room-by-Room Guide",
      slug: "decluttering-guide",
      category: "decluttering",
      excerpt: "Transform your home with our comprehensive decluttering guide. We break down each room and provide actionable steps to reclaim your space.",
      image: "/placeholder.svg",
      author: "StoneRiver Team",
      date: "January 5, 2026",
      readTime: "8 min read",
      tags: ["Decluttering", "Organization", "Home"]
    },
    {
      id: 4,
      title: "The Environmental Impact of Proper Junk Disposal",
      slug: "environmental-impact-junk-disposal",
      category: "environment",
      excerpt: "Discover how proper junk disposal and recycling can make a significant positive impact on our environment and local communities.",
      image: "/placeholder.svg",
      author: "StoneRiver Team",
      date: "December 28, 2025",
      readTime: "6 min read",
      tags: ["Environment", "Recycling", "Sustainability"]
    },
    {
      id: 5,
      title: "Estate Cleanouts: A Compassionate Approach",
      slug: "estate-cleanouts-guide",
      category: "services",
      excerpt: "Handling an estate cleanout can be emotional. Learn how to approach this sensitive task with care while ensuring everything is handled properly.",
      image: "/placeholder.svg",
      author: "StoneRiver Team",
      date: "December 20, 2025",
      readTime: "7 min read",
      tags: ["Estate Cleanout", "Services", "Tips"]
    },
    {
      id: 6,
      title: "Commercial Junk Removal: What Businesses Need to Know",
      slug: "commercial-junk-removal-guide",
      category: "business",
      excerpt: "A guide for businesses on efficient junk removal. From office cleanouts to retail renovations, we cover best practices and cost-saving tips.",
      image: "/placeholder.svg",
      author: "StoneRiver Team",
      date: "December 15, 2025",
      readTime: "5 min read",
      tags: ["Commercial", "Business", "Junk Removal"]
    },
  ];

  const categories = [
    { key: "all", label: "All Articles" },
    { key: "tips", label: "Tips & Guides" },
    { key: "recycling", label: "Recycling" },
    { key: "decluttering", label: "Decluttering" },
    { key: "environment", label: "Environment" },
    { key: "services", label: "Services" },
    { key: "business", label: "Business" },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Resources</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Blog &{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Resources</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Tips, guides, and insights on junk removal, recycling, and decluttering.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 pl-12 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-3 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                  selectedCategory === category.key
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-primary transition-all group cursor-pointer"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <img src={articles[0].image} alt={articles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-lg font-bold uppercase text-sm">
                  Featured
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mb-4 w-fit">
                  {articles[0].category}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 group-hover:text-primary transition-colors">
                  {articles[0].title}
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-4 h-4" />
                    {articles[0].date}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-4 h-4" />
                    {articles[0].readTime}
                  </span>
                </div>
                <a
                  href={`/blog/${articles[0].slug}`}
                  className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                >
                  Read Article
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.slice(1).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="aspect-[16/9] bg-gray-200 relative overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mb-3">
                    {article.category}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <a
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get the latest tips, guides, and updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-14 bg-white text-gray-900 flex-1"
              />
              <button className="bg-white text-primary hover:bg-gray-100 font-black px-8 py-4 rounded-xl transition-all h-14">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-white/70 mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
