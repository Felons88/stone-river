// SEO Schema.org structured data generators

export const generateServiceSchema = (serviceName: string, description: string, price?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: serviceName,
  provider: {
    '@type': 'LocalBusiness',
    name: 'StoneRiver Junk Removal',
    telephone: '(612) 685-4696',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'St. Cloud',
      addressRegion: 'MN',
      postalCode: '56301',
      addressCountry: 'US',
    },
  },
  description: description,
  areaServed: {
    '@type': 'City',
    name: 'St. Cloud',
  },
  ...(price && {
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'USD',
    },
  }),
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://stoneriverjunk.com${item.url}`,
  })),
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateReviewSchema = (reviews: any[]) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'StoneRiver Junk Removal',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  },
  review: reviews.slice(0, 10).map((review) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author_name,
    },
    datePublished: review.time,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
  })),
});

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'StoneRiver Junk Removal',
  url: 'https://stoneriverjunk.com',
  logo: 'https://stoneriverjunk.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '(612) 685-4696',
    contactType: 'Customer Service',
    areaServed: 'US',
    availableLanguage: 'English',
  },
  sameAs: [
    'https://www.facebook.com/stoneriverjunk',
    'https://www.instagram.com/stoneriverjunk',
  ],
});

export const generateWebPageSchema = (title: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description: description,
  url: `https://stoneriverjunk.com${url}`,
  publisher: {
    '@type': 'Organization',
    name: 'StoneRiver Junk Removal',
  },
  inLanguage: 'en-US',
});

export const generateBookingSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ReservationAction',
  target: {
    '@type': 'EntryPoint',
    urlTemplate: 'https://stoneriverjunk.com/booking',
    actionPlatform: [
      'http://schema.org/DesktopWebPlatform',
      'http://schema.org/MobileWebPlatform',
    ],
  },
  result: {
    '@type': 'Reservation',
    name: 'Junk Removal Service Booking',
  },
});

export default {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateReviewSchema,
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBookingSchema,
};
