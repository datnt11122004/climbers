import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ['.env', '.env.local'] });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const bots: Prisma.BotCreateInput[] = [
  {
    name: 'Steamy Climber Bot',
    token: '8529038898:AAGeyS8jysmMDnTh6Yn8X9FY-5kGedMNjNY',
    active: true,
    interactive: true,
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const data of bots) {
    const bot = await prisma.bot.upsert(
      {
        where: { name: data.name },
        update: data,
        create: data,
      }
    );
    console.log(`Created bot with id: ${bot.name}`);
  }

  // Seed App Categories
  const categories = [
    { name: 'Remote', slug: 'remote', description: 'Ứng dụng điều khiển từ xa, remote desktop, screen mirror', icon: 'monitor-smartphone', color: 'blue', sortOrder: 1 },
    { name: 'Money', slug: 'money', description: 'Ứng dụng kiếm tiền, cash reward, earn money online', icon: 'banknote', color: 'green', sortOrder: 2 },
    { name: 'Loan', slug: 'loan', description: 'Ứng dụng cho vay, tính lãi suất, quản lý khoản vay', icon: 'credit-card', color: 'pink', sortOrder: 3 },
    { name: 'PDF', slug: 'pdf', description: 'Ứng dụng đọc, chỉnh sửa, scan tài liệu PDF', icon: 'file-text', color: 'orange', sortOrder: 4 },
    { name: 'VPN', slug: 'vpn', description: 'Ứng dụng VPN, proxy, bảo mật kết nối internet', icon: 'shield', color: 'cyan', sortOrder: 5 },
    { name: 'Scanner', slug: 'scanner', description: 'Ứng dụng quét tài liệu, QR code, barcode scanner', icon: 'scan', color: 'yellow', sortOrder: 6 },
    { name: 'Cleaner', slug: 'cleaner', description: 'Ứng dụng dọn dẹp, tăng tốc, giải phóng bộ nhớ', icon: 'trash-2', color: 'red', sortOrder: 7 },
    { name: 'Weather', slug: 'weather', description: 'Ứng dụng dự báo thời tiết, thời tiết trực tiếp', icon: 'cloud-sun', color: 'violet', sortOrder: 8 },
    { name: 'Launcher', slug: 'launcher', description: 'Ứng dụng launcher, theme, icon pack cho Android', icon: 'rocket', color: 'teal', sortOrder: 9 },
    { name: 'Keyboard', slug: 'keyboard', description: 'Ứng dụng bàn phím, emoji keyboard, gõ tiếng Việt', icon: 'keyboard', color: 'indigo', sortOrder: 10 },
    { name: 'Gallery', slug: 'gallery', description: 'Ứng dụng quản lý ảnh, gallery, photo editor', icon: 'image', color: 'fuchsia', sortOrder: 11 },
    { name: 'Battery', slug: 'battery', description: 'Ứng dụng tiết kiệm pin, quản lý pin, battery saver', icon: 'battery-charging', color: 'lime', sortOrder: 12 },
    { name: 'Music', slug: 'music', description: 'Ứng dụng nghe nhạc, music player, nhận diện bài hát', icon: 'music', color: 'rose', sortOrder: 13 },
    { name: 'Video', slug: 'video', description: 'Ứng dụng xem video, video player, video editor', icon: 'video', color: 'sky', sortOrder: 14 },
    { name: 'File Manager', slug: 'file-manager', description: 'Ứng dụng quản lý file, trình quản lý tệp tin', icon: 'folder', color: 'amber', sortOrder: 15 },
  ];

  for (const cat of categories) {
    const category = await prisma.appCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder },
      create: cat,
    });
    console.log(`Upserted AppCategory: ${category.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

