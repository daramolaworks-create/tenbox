import { ImageSourcePropType } from 'react-native';

export interface Store {
    name: string;
    url: string;
    logo: ImageSourcePropType | string;
    region?: 'USA' | 'UK' | 'UAE' | 'Global';
    currency?: string;
}

/**
 * Build a Google favicon URL for a given domain.
 * NOTE: The <Image> component in ShopView.tsx should use an onError fallback
 * to handle cases where the favicon service is unavailable.
 */
const faviconUrl = (domain: string) =>
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const STORES: Store[] = [
    // USA
    { name: 'Amazon US', url: 'https://www.amazon.com', logo: faviconUrl('amazon.com'), region: 'USA', currency: 'USD' },
    { name: 'Walmart', url: 'https://www.walmart.com', logo: faviconUrl('walmart.com'), region: 'USA', currency: 'USD' },
    { name: 'Target', url: 'https://www.target.com', logo: faviconUrl('target.com'), region: 'USA', currency: 'USD' },
    { name: 'Best Buy', url: 'https://www.bestbuy.com', logo: faviconUrl('bestbuy.com'), region: 'USA', currency: 'USD' },
    { name: 'Macy\'s', url: 'https://www.macys.com', logo: faviconUrl('macys.com'), region: 'USA', currency: 'USD' },
    { name: 'Costco', url: 'https://www.costco.com', logo: faviconUrl('costco.com'), region: 'USA', currency: 'USD' },
    { name: 'Home Depot', url: 'https://www.homedepot.com', logo: faviconUrl('homedepot.com'), region: 'USA', currency: 'USD' },
    { name: 'Sephora US', url: 'https://www.sephora.com', logo: faviconUrl('sephora.com'), region: 'USA', currency: 'USD' },
    { name: 'Nordstrom', url: 'https://www.nordstrom.com', logo: faviconUrl('nordstrom.com'), region: 'USA', currency: 'USD' },
    { name: 'Bloomingdale\'s', url: 'https://www.bloomingdales.com', logo: faviconUrl('bloomingdales.com'), region: 'USA', currency: 'USD' },

    // UK
    { name: 'Amazon UK', url: 'https://www.amazon.co.uk', logo: faviconUrl('amazon.co.uk'), region: 'UK', currency: 'GBP' },
    { name: 'Argos', url: 'https://www.argos.co.uk', logo: faviconUrl('argos.co.uk'), region: 'UK', currency: 'GBP' },
    { name: 'Tesco', url: 'https://www.tesco.com', logo: faviconUrl('tesco.com'), region: 'UK', currency: 'GBP' },
    { name: 'Marks & Spencer', url: 'https://www.marksandspencer.com', logo: faviconUrl('marksandspencer.com'), region: 'UK', currency: 'GBP' },
    { name: 'John Lewis', url: 'https://www.johnlewis.com', logo: faviconUrl('johnlewis.com'), region: 'UK', currency: 'GBP' },
    { name: 'Currys', url: 'https://www.currys.co.uk', logo: faviconUrl('currys.co.uk'), region: 'UK', currency: 'GBP' },
    { name: 'ASOS', url: 'https://www.asos.com', logo: faviconUrl('asos.com'), region: 'UK', currency: 'GBP' },
    { name: 'Harrods', url: 'https://www.harrods.com', logo: faviconUrl('harrods.com'), region: 'UK', currency: 'GBP' },
    { name: 'Selfridges', url: 'https://www.selfridges.com', logo: faviconUrl('selfridges.com'), region: 'UK', currency: 'GBP' },

    // UAE
    { name: 'Amazon UAE', url: 'https://www.amazon.ae', logo: faviconUrl('amazon.ae'), region: 'UAE', currency: 'AED' },
    { name: 'Noon', url: 'https://www.noon.com', logo: faviconUrl('noon.com'), region: 'UAE', currency: 'AED' },
    { name: 'Namshi', url: 'https://www.namshi.com', logo: faviconUrl('namshi.com'), region: 'UAE', currency: 'AED' },
    { name: 'Carrefour UAE', url: 'https://www.carrefouruae.com', logo: faviconUrl('carrefouruae.com'), region: 'UAE', currency: 'AED' },
    { name: 'Sharaf DG', url: 'https://www.sharafdg.com', logo: faviconUrl('sharafdg.com'), region: 'UAE', currency: 'AED' },
    { name: 'Ounass', url: 'https://www.ounass.ae', logo: faviconUrl('ounass.ae'), region: 'UAE', currency: 'AED' },
    { name: 'Sephora UAE', url: 'https://www.sephora.ae', logo: faviconUrl('sephora.ae'), region: 'UAE', currency: 'AED' },
    { name: 'Namshi (Luxury)', url: 'https://www.namshi.com/luxury/', logo: faviconUrl('namshi.com'), region: 'UAE', currency: 'AED' },
    { name: 'Dubai Mall Brands', url: 'https://thedubaimall.com/', logo: faviconUrl('thedubaimall.com'), region: 'UAE', currency: 'AED' },
    { name: 'Harvey Nichols Dubai', url: 'https://www.harveynichols.com/dubai', logo: faviconUrl('harveynichols.com'), region: 'UAE', currency: 'AED' },

    // More International Stores (Distributed to USA mostly as they ship globally from US hubs, or fit US demographic)
    { name: 'Gucci', url: 'https://www.gucci.com', logo: faviconUrl('gucci.com'), region: 'USA', currency: 'USD' },
    { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com', logo: faviconUrl('louisvuitton.com'), region: 'USA', currency: 'USD' },
    { name: 'Prada', url: 'https://www.prada.com', logo: faviconUrl('prada.com'), region: 'USA', currency: 'USD' },
    { name: 'Hermès', url: 'https://www.hermes.com', logo: faviconUrl('hermes.com'), region: 'USA', currency: 'USD' },
    { name: 'eBay', url: 'https://www.ebay.com', logo: faviconUrl('ebay.com'), region: 'USA', currency: 'USD' },
    { name: 'H&M', url: 'https://www2.hm.com', logo: faviconUrl('hm.com'), region: 'USA', currency: 'USD' },
    { name: 'Nike', url: 'https://www.nike.com', logo: faviconUrl('nike.com'), region: 'USA', currency: 'USD' },

    // More International Stores (Distributed to UK)
    { name: 'Farfetch', url: 'https://www.farfetch.com', logo: faviconUrl('farfetch.com'), region: 'UK', currency: 'GBP' },
    { name: 'SSENSE', url: 'https://www.ssense.com', logo: faviconUrl('ssense.com'), region: 'UK', currency: 'GBP' },
    { name: 'Net-A-Porter', url: 'https://www.net-a-porter.com', logo: faviconUrl('net-a-porter.com'), region: 'UK', currency: 'GBP' },
    { name: 'Zara', url: 'https://www.zara.com', logo: faviconUrl('zara.com'), region: 'UK', currency: 'GBP' },
];
