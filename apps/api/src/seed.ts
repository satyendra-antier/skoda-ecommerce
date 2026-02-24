import { DataSource } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SiteSetting } from './entities/site-setting.entity';

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || 'data/skoda.db',
  entities: [Product, Order, OrderItem, SiteSetting],
  synchronize: true,
});

const DEFAULT_CATEGORIES = ['Accessories', 'Interior', 'Exterior', 'Lifestyle', 'Technology'];

function imageUrls(sku: string, count: number = 3): string[] {
  return Array.from({ length: count }, (_, i) =>
    `https://picsum.photos/seed/${encodeURIComponent(sku)}-${i}/600/450`,
  );
}

function categoryFromSku(sku: string): string {
  const u = sku.toUpperCase();
  if (u.includes('MUG') || u.includes('BAG') || u.includes('BOTTLE') || u.includes('BLANKET') || u.includes('COOLER') || u.includes('SCARF') || u.includes('TSHIRT') || u.includes('JACKET') || u.includes('CAP') || u.includes('HAT') || u.includes('BEANIE') || u.includes('SOCKS') || u.includes('GLOVES')) return 'Lifestyle';
  if (u.includes('MAT') || u.includes('COVER') || u.includes('AIRFRESH') || u.includes('STEERING')) return 'Interior';
  if (u.includes('SUNSHADE') || u.includes('UMBRELLA')) return 'Exterior';
  if (u.includes('PHONE') || u.includes('LAPTOP') || u.includes('CABLE') || u.includes('POWERBANK') || u.includes('SPEAKER') || u.includes('TORCH') || u.includes('WATCH')) return 'Technology';
  return 'Accessories';
}

const SEED_PRODUCTS: Array<{
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  price: string;
  stockQuantity: number;
}> = [
  { sku: 'SKD-MUG-001', name: 'ŠKODA Lifestyle Mug', shortDescription: 'Premium ceramic mug with ŠKODA branding.', description: 'A durable ceramic mug perfect for your daily drive. Dishwasher safe.', specifications: { Material: 'Ceramic', Capacity: '350ml' }, price: '499.00', stockQuantity: 50 },
  { sku: 'SKD-MUG-002', name: 'ŠKODA Travel Tumbler', shortDescription: 'Insulated stainless steel tumbler.', description: 'Keep drinks hot or cold. Leak-proof lid, 500ml.', specifications: { Material: 'Stainless steel', Capacity: '500ml' }, price: '1299.00', stockQuantity: 40 },
  { sku: 'SKD-MUG-003', name: 'ŠKODA Double Wall Mug', shortDescription: 'Elegant double-wall glass mug.', description: 'Stays cool to touch. Perfect for coffee.', specifications: { Material: 'Glass', Capacity: '300ml' }, price: '899.00', stockQuantity: 35 },
  { sku: 'SKD-CAP-001', name: 'ŠKODA Cap', shortDescription: 'Classic cap with embroidered logo.', description: 'Comfortable cotton cap with adjustable strap.', specifications: { Material: 'Cotton', 'One size': 'Fits all' }, price: '799.00', stockQuantity: 30 },
  { sku: 'SKD-CAP-002', name: 'ŠKODA Performance Cap', shortDescription: 'Lightweight sports cap.', description: 'Moisture-wicking fabric, ventilated.', specifications: { Material: 'Polyester', 'One size': 'Fits all' }, price: '949.00', stockQuantity: 25 },
  { sku: 'SKD-CAP-003', name: 'ŠKODA Dad Cap', shortDescription: 'Unstructured low-profile cap.', description: 'Casual fit, embroidered logo.', specifications: { Material: 'Cotton', 'One size': 'Fits all' }, price: '749.00', stockQuantity: 45 },
  { sku: 'SKD-BAG-001', name: 'ŠKODA Tote Bag', shortDescription: 'Spacious tote bag for everyday use.', description: 'Eco-friendly tote bag with ample space.', specifications: { Material: 'Canvas', Dimensions: '40x35 cm' }, price: '999.00', stockQuantity: 20 },
  { sku: 'SKD-BAG-002', name: 'ŠKODA Backpack', shortDescription: 'Laptop-friendly backpack.', description: 'Padded laptop compartment, multiple pockets.', specifications: { Material: 'Polyester', Dimensions: '45x30x15 cm' }, price: '2499.00', stockQuantity: 15 },
  { sku: 'SKD-BAG-003', name: 'ŠKODA Duffel Bag', shortDescription: 'Weekend duffel with shoulder strap.', description: 'Durable, water-resistant. Ideal for travel.', specifications: { Material: 'Nylon', Dimensions: '50x25 cm' }, price: '1899.00', stockQuantity: 18 },
  { sku: 'SKD-BAG-004', name: 'ŠKODA Crossbody Bag', shortDescription: 'Compact crossbody for essentials.', description: 'Adjustable strap, secure zip closure.', specifications: { Material: 'Leather look', Dimensions: '25x20 cm' }, price: '1199.00', stockQuantity: 22 },
  { sku: 'SKD-TSHIRT-001', name: 'ŠKODA Logo T-Shirt', shortDescription: 'Cotton crew neck with logo.', description: '100% cotton, relaxed fit. Machine washable.', specifications: { Material: 'Cotton', Sizes: 'S–XL' }, price: '899.00', stockQuantity: 60 },
  { sku: 'SKD-TSHIRT-002', name: 'ŠKODA Polo Shirt', shortDescription: 'Classic polo with embroidered logo.', description: 'Piqué cotton, collar. Smart casual.', specifications: { Material: 'Cotton piqué', Sizes: 'S–XL' }, price: '1299.00', stockQuantity: 40 },
  { sku: 'SKD-TSHIRT-003', name: 'ŠKODA Performance Tee', shortDescription: 'Moisture-wicking athletic tee.', description: 'Lightweight, quick-dry fabric.', specifications: { Material: 'Polyester blend', Sizes: 'S–XL' }, price: '1099.00', stockQuantity: 35 },
  { sku: 'SKD-JACKET-001', name: 'ŠKODA Softshell Jacket', shortDescription: 'Wind and water resistant jacket.', description: 'Lightweight, packable. Ideal for driving.', specifications: { Material: 'Polyester', Sizes: 'S–XL' }, price: '3499.00', stockQuantity: 20 },
  { sku: 'SKD-JACKET-002', name: 'ŠKODA Fleece Jacket', shortDescription: 'Warm fleece zip jacket.', description: 'Soft inner, logo on chest.', specifications: { Material: 'Fleece', Sizes: 'S–XL' }, price: '2299.00', stockQuantity: 25 },
  { sku: 'SKD-KEYRING-001', name: 'ŠKODA Key Ring', shortDescription: 'Metal key ring with logo.', description: 'Sturdy metal, enamel logo detail.', specifications: { Material: 'Metal', Type: 'Key ring' }, price: '399.00', stockQuantity: 80 },
  { sku: 'SKD-KEYRING-002', name: 'ŠKODA Leather Key Holder', shortDescription: 'Leather key pouch with ring.', description: 'Genuine leather, compact.', specifications: { Material: 'Leather', Type: 'Key holder' }, price: '699.00', stockQuantity: 50 },
  { sku: 'SKD-UMBRELLA-001', name: 'ŠKODA Compact Umbrella', shortDescription: 'Auto-open compact umbrella.', description: 'Fits in bag. Wind-resistant.', specifications: { Material: 'Polyester', Length: '32 cm closed' }, price: '799.00', stockQuantity: 30 },
  { sku: 'SKD-UMBRELLA-002', name: 'ŠKODA Golf Umbrella', shortDescription: 'Large golf umbrella with logo.', description: 'Wide canopy, sturdy frame.', specifications: { Material: 'Polyester', 'Canopy width': '130 cm' }, price: '1299.00', stockQuantity: 15 },
  { sku: 'SKD-WALLET-001', name: 'ŠKODA Bifold Wallet', shortDescription: 'Slim bifold wallet.', description: 'Card slots, bill compartment.', specifications: { Material: 'Synthetic leather', Dimensions: '10x8 cm' }, price: '1499.00', stockQuantity: 28 },
  { sku: 'SKD-WALLET-002', name: 'ŠKODA Card Holder', shortDescription: 'Minimal card holder.', description: 'Holds cards and notes. RFID blocking.', specifications: { Material: 'Leather', Slots: '6' }, price: '999.00', stockQuantity: 42 },
  { sku: 'SKD-BOTTLE-001', name: 'ŠKODA Water Bottle', shortDescription: 'Reusable 750ml water bottle.', description: 'BPA-free, wide mouth. Easy to clean.', specifications: { Material: 'Stainless steel', Capacity: '750ml' }, price: '899.00', stockQuantity: 55 },
  { sku: 'SKD-BOTTLE-002', name: 'ŠKODA Sports Bottle', shortDescription: 'Squeeze sports bottle 500ml.', description: 'One-hand operation. Dishwasher safe.', specifications: { Material: 'Plastic', Capacity: '500ml' }, price: '499.00', stockQuantity: 70 },
  { sku: 'SKD-BLANKET-001', name: 'ŠKODA Picnic Blanket', shortDescription: 'Water-resistant picnic blanket.', description: 'Fleece one side, waterproof other. Folds compact.', specifications: { Material: 'Fleece + polyester', Dimensions: '150x120 cm' }, price: '1599.00', stockQuantity: 20 },
  { sku: 'SKD-BLANKET-002', name: 'ŠKODA Travel Blanket', shortDescription: 'Soft travel blanket for car.', description: 'Compact, machine washable.', specifications: { Material: 'Fleece', Dimensions: '100x80 cm' }, price: '1199.00', stockQuantity: 25 },
  { sku: 'SKD-TOWEL-001', name: 'ŠKODA Microfibre Towel', shortDescription: 'Quick-dry microfibre towel.', description: 'Compact, absorbent. For gym or travel.', specifications: { Material: 'Microfibre', Dimensions: '80x40 cm' }, price: '649.00', stockQuantity: 45 },
  { sku: 'SKD-SCARF-001', name: 'ŠKODA Scarf', shortDescription: 'Lightweight branded scarf.', description: 'Soft fabric, reversible. Unisex.', specifications: { Material: 'Polyester blend', Dimensions: '180x70 cm' }, price: '999.00', stockQuantity: 30 },
  { sku: 'SKD-GLOVES-001', name: 'ŠKODA Driving Gloves', shortDescription: 'Leather driving gloves.', description: 'Touch-screen compatible fingertips.', specifications: { Material: 'Leather', Sizes: 'S–L' }, price: '2499.00', stockQuantity: 18 },
  { sku: 'SKD-BELT-001', name: 'ŠKODA Leather Belt', shortDescription: 'Classic leather belt with buckle.', description: 'Genuine leather, metal buckle.', specifications: { Material: 'Leather', Sizes: '95–120 cm' }, price: '1899.00', stockQuantity: 22 },
  { sku: 'SKD-SOCKS-001', name: 'ŠKODA Crew Socks Pack', shortDescription: 'Pack of 3 crew socks.', description: 'Cotton blend, cushioned sole.', specifications: { Material: 'Cotton blend', 'Pack': '3 pairs' }, price: '499.00', stockQuantity: 65 },
  { sku: 'SKD-PEN-001', name: 'ŠKODA Ballpoint Pen', shortDescription: 'Metal ballpoint with logo.', description: 'Smooth writing, refillable.', specifications: { Material: 'Metal', Type: 'Ballpoint' }, price: '349.00', stockQuantity: 100 },
  { sku: 'SKD-NOTEBOOK-001', name: 'ŠKODA Notebook', shortDescription: 'A5 hardcover notebook.', description: 'Lined pages, branded cover.', specifications: { Material: 'Paper + hardcover', Pages: '120' }, price: '449.00', stockQuantity: 50 },
  { sku: 'SKD-PHONECASE-001', name: 'ŠKODA Phone Case', shortDescription: 'Protective phone case with logo.', description: 'Fits most smartphones. Slim fit.', specifications: { Material: 'TPU', Compatibility: 'Universal' }, price: '599.00', stockQuantity: 40 },
  { sku: 'SKD-LAPTOP-001', name: 'ŠKODA Laptop Sleeve', shortDescription: 'Padded laptop sleeve.', description: 'Fits 13–15 inch laptops. Neoprene.', specifications: { Material: 'Neoprene', 'Fits': 'Up to 15"' }, price: '899.00', stockQuantity: 28 },
  { sku: 'SKD-SUNSHADE-001', name: 'ŠKODA Windscreen Sun Shade', shortDescription: 'Foldable windscreen sun shade.', description: 'Reflective, folds to compact size.', specifications: { Material: 'Reflective foil', 'Fits': 'Standard' }, price: '799.00', stockQuantity: 35 },
  { sku: 'SKD-AIRFRESH-001', name: 'ŠKODA Car Air Freshener', shortDescription: 'Vent clip air freshener.', description: 'Long-lasting scent. Clip design.', specifications: { Material: 'Scented gel', Type: 'Vent clip' }, price: '299.00', stockQuantity: 90 },
  { sku: 'SKD-COVER-001', name: 'ŠKODA Steering Wheel Cover', shortDescription: 'Leather steering wheel cover.', description: 'Improves grip. Universal fit.', specifications: { Material: 'Leather', 'Fit': 'Universal' }, price: '1299.00', stockQuantity: 24 },
  { sku: 'SKD-MAT-001', name: 'ŠKODA Car Mat Set', shortDescription: 'Set of 4 car floor mats.', description: 'Custom fit, rubber. Easy to clean.', specifications: { Material: 'Rubber', 'Set': '4 mats' }, price: '2499.00', stockQuantity: 16 },
  { sku: 'SKD-TORCH-001', name: 'ŠKODA LED Torch', shortDescription: 'Compact LED torch with logo.', description: 'USB rechargeable. Multiple modes.', specifications: { Material: 'Aluminium', 'Battery': 'Built-in' }, price: '699.00', stockQuantity: 38 },
  { sku: 'SKD-POWERBANK-001', name: 'ŠKODA Power Bank', shortDescription: '10000mAh power bank.', description: 'Dual USB out. Compact design.', specifications: { Capacity: '10000mAh', Ports: '2' }, price: '1499.00', stockQuantity: 32 },
  { sku: 'SKD-CABLE-001', name: 'ŠKODA USB Cable Pack', shortDescription: 'Pack of 2 USB-C cables.', description: '1m length. Durable braided.', specifications: { Type: 'USB-C', 'Pack': '2' }, price: '449.00', stockQuantity: 75 },
  { sku: 'SKD-HAT-001', name: 'ŠKODA Beanie', shortDescription: 'Knit beanie with logo.', description: 'Warm, stretch fit. One size.', specifications: { Material: 'Acrylic knit', 'One size': 'Fits all' }, price: '649.00', stockQuantity: 40 },
  { sku: 'SKD-SNACK-001', name: 'ŠKODA Snack Box', shortDescription: 'Curated snack selection.', description: 'Assorted premium snacks for the road.', specifications: { Contents: 'Assorted', 'Shelf life': '6 months' }, price: '599.00', stockQuantity: 45 },
  { sku: 'SKD-COOLER-001', name: 'ŠKODA Cooler Bag', shortDescription: 'Insulated cooler bag.', description: 'Keeps food and drinks cold. 20L capacity.', specifications: { Material: 'Insulated', Capacity: '20L' }, price: '1799.00', stockQuantity: 18 },
  { sku: 'SKD-SPEAKER-001', name: 'ŠKODA Bluetooth Speaker', shortDescription: 'Portable Bluetooth speaker.', description: 'Water-resistant. 10hr battery.', specifications: { Connectivity: 'Bluetooth', 'Battery': '10h' }, price: '2999.00', stockQuantity: 14 },
  { sku: 'SKD-WATCH-001', name: 'ŠKODA Sport Watch', shortDescription: 'Digital sport watch with logo.', description: 'Stopwatch, backlight. Water resistant.', specifications: { Material: 'Silicone + plastic', 'Water': '50m' }, price: '1999.00', stockQuantity: 22 },
  { sku: 'SKD-SUNGLASSES-001', name: 'ŠKODA Sunglasses', shortDescription: 'UV protection sunglasses.', description: 'Polarised lenses. Branded case included.', specifications: { Material: 'Acetate', 'UV': '400' }, price: '2299.00', stockQuantity: 20 },
  { sku: 'SKD-LUGGAGE-001', name: 'ŠKODA Cabin Luggage', shortDescription: '55cm cabin-size trolley.', description: '4 wheels, TSA lock. Lightweight.', specifications: { Dimensions: '55x40x20 cm', 'Wheels': '4' }, price: '4999.00', stockQuantity: 12 },
  { sku: 'SKD-POUCH-001', name: 'ŠKODA Toiletries Pouch', shortDescription: 'Water-resistant toiletries bag.', description: 'Hanging hook. Multiple pockets.', specifications: { Material: 'Nylon', Dimensions: '24x14 cm' }, price: '699.00', stockQuantity: 35 },
  { sku: 'SKD-PASSHOLDER-001', name: 'ŠKODA Pass Holder', shortDescription: 'Lanyard with pass holder.', description: 'Adjustable lanyard. Clear pocket.', specifications: { Material: 'Polyester', Type: 'Lanyard' }, price: '349.00', stockQuantity: 60 },
  { sku: 'SKD-COASTER-001', name: 'ŠKODA Coaster Set', shortDescription: 'Set of 4 cork coasters.', description: 'Cork base, branded top. Absorbent.', specifications: { Material: 'Cork', 'Set': '4' }, price: '399.00', stockQuantity: 55 },
  { sku: 'SKD-DESK-001', name: 'ŠKODA Desk Organiser', shortDescription: 'Desktop organiser with tray.', description: 'Pen holder, tray. Minimal design.', specifications: { Material: 'Metal', Dimensions: '25x15 cm' }, price: '1299.00', stockQuantity: 25 },
];

const TARGET_COUNT = 50;

async function seed() {
  const ds = await dataSource.initialize();
  const settingRepo = ds.getRepository(SiteSetting);
  await settingRepo.upsert(
    { key: 'categories', value: JSON.stringify(DEFAULT_CATEGORIES) },
    ['key'],
  );
  console.log('Seed: Categories ensured.');

  const repo = ds.getRepository(Product);
  const count = await repo.count();
  if (count >= TARGET_COUNT) {
    await ds.destroy();
    console.log('Seed: Already have at least 50 products. Skipping.');
    return;
  }
  const existing = await repo.find({ select: ['sku'] });
  const existingSkus = new Set(existing.map((p) => p.sku));
  const toInsert = SEED_PRODUCTS.filter((p) => !existingSkus.has(p.sku)).map((p) => ({
    ...p,
    category: categoryFromSku(p.sku),
    imageUrls: imageUrls(p.sku, p.sku.includes('MUG') || p.sku.includes('BAG') ? 4 : 3),
    status: ProductStatus.Active,
  }));
  if (toInsert.length === 0) {
    await ds.destroy();
    console.log('Seed: No new products to insert.');
    return;
  }
  await repo.save(toInsert);
  await ds.destroy();
  console.log(`Seed: ${toInsert.length} products created (total now ${count + toInsert.length}).`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
