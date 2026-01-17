import { ImageSourcePropType } from 'react-native';

export interface Store {
    name: string;
    url: string;
    logo: ImageSourcePropType;
    region?: 'USA' | 'UK' | 'UAE' | 'Global';
    currency?: string;
}

export const STORES: Store[] = [
    // USA / Global Top
    { name: 'Amazon US', url: 'https://www.amazon.com', logo: require('../assets/logos/amazon.png'), region: 'USA', currency: 'USD' },
    { name: 'eBay', url: 'https://www.ebay.com', logo: require('../assets/logos/ebay.png'), region: 'Global', currency: 'USD' },
    { name: 'Walmart', url: 'https://www.walmart.com', logo: require('../assets/walmart.png'), region: 'USA', currency: 'USD' },
    { name: 'Target', url: 'https://www.target.com', logo: require('../assets/logos/target.png'), region: 'USA', currency: 'USD' },
    { name: 'Best Buy', url: 'https://www.bestbuy.com', logo: require('../assets/logos/bestbuy.png'), region: 'USA', currency: 'USD' },
    { name: 'Macy\'s', url: 'https://www.macys.com', logo: require('../assets/logos/macys.png'), region: 'USA', currency: 'USD' },
    { name: 'Costco', url: 'https://www.costco.com', logo: require('../assets/logos/costco.png'), region: 'USA', currency: 'USD' },
    { name: 'Home Depot', url: 'https://www.homedepot.com', logo: require('../assets/logos/homedepot.png'), region: 'USA', currency: 'USD' },

    // UK
    { name: 'Amazon UK', url: 'https://www.amazon.co.uk', logo: require('../assets/logos/amazon.png'), region: 'UK', currency: 'GBP' },
    { name: 'Argos', url: 'https://www.argos.co.uk', logo: require('../assets/logos/argos.png'), region: 'UK', currency: 'GBP' },
    { name: 'Tesco', url: 'https://www.tesco.com', logo: require('../assets/logos/tesco.png'), region: 'UK', currency: 'GBP' },
    { name: 'Marks & Spencer', url: 'https://www.marksandspencer.com', logo: require('../assets/logos/marksandspencer.png'), region: 'UK', currency: 'GBP' },
    { name: 'John Lewis', url: 'https://www.johnlewis.com', logo: require('../assets/logos/johnlewis.png'), region: 'UK', currency: 'GBP' },
    { name: 'Currys', url: 'https://www.currys.co.uk', logo: require('../assets/logos/currys.png'), region: 'UK', currency: 'GBP' },
    { name: 'ASOS', url: 'https://www.asos.com', logo: require('../assets/asos.png'), region: 'UK', currency: 'GBP' },

    // UAE
    { name: 'Amazon UAE', url: 'https://www.amazon.ae', logo: require('../assets/logos/amazon.png'), region: 'UAE', currency: 'AED' },
    { name: 'Noon', url: 'https://www.noon.com', logo: require('../assets/logos/noon.png'), region: 'UAE', currency: 'AED' },
    { name: 'Namshi', url: 'https://www.namshi.com', logo: require('../assets/logos/namshi.png'), region: 'UAE', currency: 'AED' },
    { name: 'Carrefour UAE', url: 'https://www.carrefouruae.com', logo: require('../assets/logos/carrefour.png'), region: 'UAE', currency: 'AED' },
    { name: 'Sharaf DG', url: 'https://www.sharafdg.com', logo: require('../assets/logos/sharafdg.png'), region: 'UAE', currency: 'AED' },

    // Fashion / Global
    { name: 'H&M', url: 'https://www2.hm.com', logo: require('../assets/logos/hm.png'), region: 'Global', currency: 'USD' },
    { name: 'Nike', url: 'https://www.nike.com', logo: require('../assets/logos/nike.png'), region: 'Global', currency: 'USD' },
    { name: 'Zara', url: 'https://www.zara.com', logo: require('../assets/logos/zara.png'), region: 'Global', currency: 'USD' },
];
