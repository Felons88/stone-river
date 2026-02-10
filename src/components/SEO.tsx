import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

const SEO = ({
  title = 'StoneRiver Junk Removal - Professional Junk Removal Services in St. Cloud, MN',
  description = 'Fast, affordable, and eco-friendly junk removal services in St. Cloud, MN. Same-day service available. Licensed and insured. Free estimates. Call (612) 685-4696 today!',
  keywords = 'junk removal, junk hauling, trash removal, furniture removal, appliance removal, St. Cloud MN, Waite Park, Sartell, Sauk Rapids, eco-friendly disposal, same day service',
  image = '/og-image.jpg',
  url = 'https://stoneriverjunk.com',
  type = 'website',
  schema,
}: SEOProps) => {
  const fullTitle = title.includes('StoneRiver') ? title : `${title} | StoneRiver Junk Removal`;
  const fullUrl = url.startsWith('http') ? url : `https://stoneriverjunk.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://stoneriverjunk.com${image}`;

  // Default LocalBusiness Schema
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://stoneriverjunk.com',
    name: 'StoneRiver Junk Removal',
    image: fullImage,
    description: description,
    url: 'https://stoneriverjunk.com',
    telephone: '(612) 685-4696',
    email: 'noreply@stoneriverjunk.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'St. Cloud',
      addressRegion: 'MN',
      postalCode: '56301',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.5608,
      longitude: -94.1624,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'St. Cloud',
        '@id': 'https://en.wikipedia.org/wiki/St._Cloud,_Minnesota',
      },
      {
        '@type': 'City',
        name: 'Waite Park',
      },
      {
        '@type': 'City',
        name: 'Sartell',
      },
      {
        '@type': 'City',
        name: 'Sauk Rapids',
      },
      {
        '@type': 'City',
        name: 'St. Joseph',
      },
    ],
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '16:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/stoneriverjunk',
      'https://www.instagram.com/stoneriverjunk',
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="StoneRiver Junk Removal" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="StoneRiver Junk Removal" />
      <meta name="geo.region" content="US-MN" />
      <meta name="geo.placename" content="St. Cloud" />
      <meta name="geo.position" content="45.5608;-94.1624" />
      <meta name="ICBM" content="45.5608, -94.1624" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
