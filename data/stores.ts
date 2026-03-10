import { ImageSourcePropType } from 'react-native';

export interface Store {
    name: string;
    url: string;
    logo: ImageSourcePropType | string;
    region?: 'USA' | 'UK' | 'UAE' | 'Global';
    currency?: string;
}

export const STORES: Store[] = [
    // USA
    { name: 'Amazon US', url: 'https://www.amazon.com', logo: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Walmart', url: 'https://www.walmart.com', logo: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Target', url: 'https://www.target.com', logo: 'https://www.google.com/s2/favicons?domain=target.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Best Buy', url: 'https://www.bestbuy.com', logo: 'https://www.google.com/s2/favicons?domain=bestbuy.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Macy\'s', url: 'https://www.macys.com', logo: 'https://www.google.com/s2/favicons?domain=macys.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Costco', url: 'https://www.costco.com', logo: 'https://www.google.com/s2/favicons?domain=costco.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Home Depot', url: 'https://www.homedepot.com', logo: 'https://www.google.com/s2/favicons?domain=homedepot.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Sephora US', url: 'https://www.sephora.com', logo: 'https://www.google.com/s2/favicons?domain=sephora.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Nordstrom', url: 'https://www.nordstrom.com', logo: 'https://www.google.com/s2/favicons?domain=nordstrom.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Bloomingdale\'s', url: 'https://www.bloomingdales.com', logo: 'https://www.google.com/s2/favicons?domain=bloomingdales.com&sz=128', region: 'USA', currency: 'USD' },

    // UK
    { name: 'Amazon UK', url: 'https://www.amazon.co.uk', logo: 'https://www.google.com/s2/favicons?domain=amazon.co.uk&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Argos', url: 'https://www.argos.co.uk', logo: 'https://www.google.com/s2/favicons?domain=argos.co.uk&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Tesco', url: 'https://www.tesco.com', logo: 'https://www.google.com/s2/favicons?domain=tesco.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Marks & Spencer', url: 'https://www.marksandspencer.com', logo: 'https://www.google.com/s2/favicons?domain=marksandspencer.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'John Lewis', url: 'https://www.johnlewis.com', logo: 'https://www.google.com/s2/favicons?domain=johnlewis.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Currys', url: 'https://www.currys.co.uk', logo: 'https://www.google.com/s2/favicons?domain=currys.co.uk&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'ASOS', url: 'https://www.asos.com', logo: 'https://www.google.com/s2/favicons?domain=asos.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Harrods', url: 'https://www.harrods.com', logo: 'https://www.google.com/s2/favicons?domain=harrods.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Selfridges', url: 'https://www.selfridges.com', logo: 'https://www.google.com/s2/favicons?domain=selfridges.com&sz=128', region: 'UK', currency: 'GBP' },

    // UAE
    { name: 'Amazon UAE', url: 'https://www.amazon.ae', logo: 'https://www.google.com/s2/favicons?domain=amazon.ae&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Noon', url: 'https://www.noon.com', logo: 'https://www.google.com/s2/favicons?domain=noon.com&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Namshi', url: 'https://www.namshi.com', logo: 'https://www.google.com/s2/favicons?domain=namshi.com&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Carrefour UAE', url: 'https://www.carrefouruae.com', logo: 'https://www.google.com/s2/favicons?domain=carrefouruae.com&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Sharaf DG', url: 'https://www.sharafdg.com', logo: 'https://www.google.com/s2/favicons?domain=sharafdg.com&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Ounass', url: 'https://www.ounass.ae', logo: 'https://www.google.com/s2/favicons?domain=ounass.ae&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Sephora UAE', url: 'https://www.sephora.ae', logo: 'https://www.google.com/s2/favicons?domain=sephora.ae&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Namshi (Luxury)', url: 'https://www.namshi.com', logo: 'https://www.google.com/s2/favicons?domain=namshi.com&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Dubai Mall Brands', url: 'https://thedubaimall.com/', logo: 'https://www.google.com/s2/favicons?domain=thedubaimall.com&sz=128', region: 'UAE', currency: 'AED' },
    { name: 'Harvey Nichols Dubai', url: 'https://www.harveynichols.com/dubai', logo: 'https://www.google.com/s2/favicons?domain=harveynichols.com&sz=128', region: 'UAE', currency: 'AED' },

    // More International Stores (Distributed to USA mostly as they ship globally from US hubs, or fit US demographic)
    { name: 'Gucci', url: 'https://www.gucci.com', logo: 'https://www.google.com/s2/favicons?domain=gucci.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com', logo: 'https://www.google.com/s2/favicons?domain=louisvuitton.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Prada', url: 'https://www.prada.com', logo: 'https://www.google.com/s2/favicons?domain=prada.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Hermès', url: 'https://www.hermes.com', logo: 'https://www.google.com/s2/favicons?domain=hermes.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'eBay', url: 'https://www.ebay.com', logo: 'https://www.google.com/s2/favicons?domain=ebay.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'H&M', url: 'https://www2.hm.com', logo: 'https://www.google.com/s2/favicons?domain=hm.com&sz=128', region: 'USA', currency: 'USD' },
    { name: 'Nike', url: 'https://www.nike.com', logo: 'https://www.google.com/s2/favicons?domain=nike.com&sz=128', region: 'USA', currency: 'USD' },

    // More International Stores (Distributed to UK)
    { name: 'Farfetch', url: 'https://www.farfetch.com', logo: 'https://www.google.com/s2/favicons?domain=farfetch.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'SSENSE', url: 'https://www.ssense.com', logo: 'https://www.google.com/s2/favicons?domain=ssense.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Net-A-Porter', url: 'https://www.net-a-porter.com', logo: 'https://www.google.com/s2/favicons?domain=net-a-porter.com&sz=128', region: 'UK', currency: 'GBP' },
    { name: 'Zara', url: 'https://www.zara.com', logo: 'https://www.google.com/s2/favicons?domain=zara.com&sz=128', region: 'UK', currency: 'GBP' },
];
