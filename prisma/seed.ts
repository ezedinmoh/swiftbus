import './load-env';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding clean high-density SQLite database...');

  // 0. Clean Existing Data in Reverse Order of Dependencies
  console.log('Cleaning existing tables...');
  await prisma.payment.deleteMany();
  await prisma.busSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.route.deleteMany();
  await prisma.busCompany.deleteMany();
  await prisma.city.deleteMany();

  // 1. Seed Cities
  const citiesData = [
    { city_code: 'addis-ababa', name: 'Addis Ababa', region: 'Addis Ababa', latitude: 9.0320, longitude: 38.7469 },
    { city_code: 'bahir-dar', name: 'Bahir Dar', region: 'Amhara', latitude: 11.5942, longitude: 37.3906 },
    { city_code: 'gondar', name: 'Gondar', region: 'Amhara', latitude: 12.6090, longitude: 37.4671 },
    { city_code: 'mekele', name: 'Mekele', region: 'Tigray', latitude: 13.4967, longitude: 39.4753 },
    { city_code: 'hawassa', name: 'Hawassa', region: 'SNNPR', latitude: 7.0621, longitude: 38.4776 },
    { city_code: 'dire-dawa', name: 'Dire Dawa', region: 'Dire Dawa', latitude: 9.5931, longitude: 41.8661 },
    { city_code: 'jimma', name: 'Jimma', region: 'Oromia', latitude: 7.6731, longitude: 36.8344 },
    { city_code: 'adama', name: 'Adama (Nazreth)', region: 'Oromia', latitude: 8.5400, longitude: 39.2675 },
    { city_code: 'dessie', name: 'Dessie', region: 'Amhara', latitude: 11.1300, longitude: 39.6333 },
    { city_code: 'kombolcha', name: 'Kombolcha', region: 'Amhara', latitude: 11.0817, longitude: 39.7436 },
    { city_code: 'arbaminch', name: 'Arba Minch', region: 'SNNPR', latitude: 6.0333, longitude: 37.5500 }
  ];

  console.log(`Seeding ${citiesData.length} cities...`);
  const cities = [];
  for (const c of citiesData) {
    const city = await prisma.city.create({
      data: {
        city_code: c.city_code,
        name: c.name,
        region: c.region,
        latitude: c.latitude,
        longitude: c.longitude,
        is_active: true,
      }
    });
    cities.push(city);
  }

  // 2. Seed Bus Companies
  const companiesData = [
    { company_id: 'selam-bus', name: 'Selam Bus', description: 'Premium bus service with luxury amenities', rating: 4.8 },
    { company_id: 'abay-bus', name: 'Abay Bus', description: 'Reliable northern routes specialist', rating: 4.5 },
    { company_id: 'sky-bus', name: 'Sky Bus', description: 'Modern fleet with excellent service', rating: 4.6 },
    { company_id: 'ethio-bus', name: 'Ethio Bus', description: 'Budget-friendly nationwide coverage', rating: 4.2 },
    { company_id: 'habesha-bus', name: 'Habesha Bus', description: 'Cultural experience with comfort', rating: 4.4 },
    { company_id: 'zemen-bus', name: 'Zemen Bus', description: 'Fast and efficient travel', rating: 4.3 }
  ];

  console.log(`Seeding ${companiesData.length} bus companies...`);
  const companies = [];
  for (const comp of companiesData) {
    const company = await prisma.busCompany.create({
      data: {
        company_id: comp.company_id,
        name: comp.name,
        description: comp.description,
        rating: comp.rating,
        total_reviews: 10,
        is_active: true,
      }
    });
    companies.push(company);
  }

  // 3. Seed Admin User
  console.log('Seeding default admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const adminEmail = 'ezedinmoh1@gmail.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: adminPasswordHash,
      first_name: 'Ezedin',
      last_name: 'Moh',
      full_name: 'Ezedin Moh',
      role: 'admin',
    },
    create: {
      user_id: 'U' + Date.now().toString().slice(-6),
      email: adminEmail,
      password_hash: adminPasswordHash,
      first_name: 'Ezedin',
      last_name: 'Moh',
      full_name: 'Ezedin Moh',
      role: 'admin',
      is_verified: true,
      joined_date: new Date(),
    }
  });

  // 4. Seed Buses Pool (5 buses for each of our 6 companies, 30 total)
  console.log('Seeding 30 buses (5 per company)...');
  const buses = [];
  const busTypes: ('economy' | 'standard' | 'standard_ac' | 'premium_ac' | 'luxury')[] = [
    'luxury', 'standard_ac', 'premium_ac', 'standard', 'economy'
  ];

  for (let i = 0; i < companies.length; i++) {
    const comp = companies[i];
    for (let j = 0; j < 5; j++) {
      const bus = await prisma.bus.create({
        data: {
          bus_id: `BUS-${comp.company_id.slice(0, 3).toUpperCase()}-${100 + j}`,
          company_id: comp.id,
          bus_number: `${comp.company_id.slice(0, 3).toUpperCase()}-${400 + i * 5 + j}`,
          bus_type: busTypes[j % busTypes.length],
          total_seats: 49,
          amenities: JSON.stringify(['Wi-Fi', 'AC', 'USB Charging', 'Water', 'TV']),
          status: 'active',
          license_plate: `ET-3-${1000 + i * 5 + j}`,
          model: 'Yutong High-Deck',
        }
      });
      buses.push(bus);
    }
  }

  // 5. Seed Fully Connected Route Network (11 * 10 = 110 routes)
  console.log('Seeding fully connected route mesh (110 routes)...');
  const routes = [];
  
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  for (let i = 0; i < cities.length; i++) {
    const origin = cities[i];
    for (let j = 0; j < cities.length; j++) {
      const dest = cities[j];
      if (origin.id === dest.id) continue;

      const lat1 = Number(origin.latitude ?? 9.0);
      const lon1 = Number(origin.longitude ?? 38.0);
      const lat2 = Number(dest.latitude ?? 9.0);
      const lon2 = Number(dest.longitude ?? 38.0);

      const distance = calculateDistance(lat1, lon1, lat2, lon2) || 100;
      const duration = distance / 60; // average 60 km/h
      const basePrice = Math.max(150, Math.round(distance * 2.2)); // minimum 150 ETB

      const route = await prisma.route.create({
        data: {
          route_id: `R-${origin.city_code.slice(0, 3)}-${dest.city_code.slice(0, 3)}`.toUpperCase(),
          origin_city_id: origin.id,
          destination_city_id: dest.id,
          distance_km: distance,
          estimated_duration_hours: Number(duration.toFixed(1)),
          base_price: basePrice,
          is_active: true,
        }
      });
      routes.push(route);
    }
  }

  // 6. Seed High-Density Schedules (4 schedules per route = 440 schedules total!)
  console.log('Seeding 440 schedules (exactly 4 options per route, from different companies)...');
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const scheduleTimes = [
    { hour: 6, minute: 30, priceFactor: 1.0 },   // 06:30 (Early Morning)
    { hour: 8, minute: 45, priceFactor: 1.1 },   // 08:45 (Mid-Morning)
    { hour: 13, minute: 15, priceFactor: 0.95 }, // 13:15 (Afternoon)
    { hour: 16, minute: 30, priceFactor: 1.2 }   // 16:30 (Late Afternoon)
  ];

  let scheduleCounter = 1000;

  for (let rIndex = 0; rIndex < routes.length; rIndex++) {
    const route = routes[rIndex];
    
    // Seed exactly 4 schedules
    for (let sIndex = 0; sIndex < 4; sIndex++) {
      const timeInfo = scheduleTimes[sIndex];
      
      // Select operating company for this schedule: index shifts based on route index and schedule index
      const companyIndex = (rIndex + sIndex) % companies.length;
      const comp = companies[companyIndex];
      
      // Find a bus from this company in our bus pool
      const companyBuses = buses.filter(b => b.company_id === comp.id);
      const bus = companyBuses[sIndex % companyBuses.length]; // cycle through that company's 5 buses

      // Departure time
      const depTime = new Date();
      depTime.setUTCHours(timeInfo.hour, timeInfo.minute, 0, 0);

      // Arrival time
      const arrTime = new Date(depTime);
      const durationHours = Number(route.estimated_duration_hours || 4);
      arrTime.setUTCSeconds(arrTime.getUTCSeconds() + Math.round(durationHours * 3600));

      const price = Math.round(Number(route.base_price) * timeInfo.priceFactor);

      await prisma.schedule.create({
        data: {
          schedule_id: `SCH-${scheduleCounter++}`,
          bus_id: bus.id,
          route_id: route.id,
          departure_time: depTime,
          arrival_time: arrTime,
          days_of_week: daysOfWeek,
          price: price,
          effective_from: new Date(),
          is_active: true,
        }
      });
    }
  }

  console.log('🎉 Clean high-density SQLite database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
