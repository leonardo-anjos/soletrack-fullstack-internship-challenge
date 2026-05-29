import { prisma } from "./database/prisma";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Iniciando seed...");

  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      name: "Carlos Admin",
      email: "admin@admin.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("👤 Admin criado");

  const sizesValues = [38, 39, 40, 41, 42];

  const sizes = await Promise.all(
    sizesValues.map((value) =>
      prisma.size.upsert({
        where: { value },
        update: {},
        create: { value },
      }),
    ),
  );

  console.log("📏 Sizes criados");

  const models = [
    { id: "NK-SPORT-001", name: "Nike Runner", category: "Running" },
    { id: "AD-SPORT-002", name: "Adidas Boost", category: "Running" },
    { id: "MZ-SPORT-003", name: "Mizuno Wave", category: "Running" },
    { id: "OK-SPORT-004", name: "Oakley Street", category: "Casual" },
  ];

  await Promise.all(
    models.map((m) =>
      prisma.shoeModel.upsert({
        where: { id: m.id },
        update: {},
        create: {
          id: m.id,
          name: m.name,
          category: m.category,
          base_cost: 120,
        },
      }),
    ),
  );

  console.log("👟 Models criados");

  const colors = [
    { color: "Black", sole: "White", code: "BLK-WHT" },
    { color: "Red", sole: "Black", code: "RED-BLK" },
    { color: "Blue", sole: "White", code: "BLU-WHT" },
    { color: "Green", sole: "Black", code: "GRN-BLK" },
  ];

  const allModels = await prisma.shoeModel.findMany();

  const variants: any[] = [];

  for (const model of allModels) {
    for (const c of colors) {
      const sku = `${model.id}-${c.code}`;

      const variant = await prisma.shoeVariant.upsert({
        where: { sku },
        update: {},
        create: {
          model_id: model.id,
          color: c.color,
          sole_color: c.sole,
          sku,
        },
      });

      variants.push(variant);
    }
  }

  console.log("🎨 Variants criadas");

  const sizesList = await prisma.size.findMany();

  // STOCK FIXO (sem aleatoriedade bagunçada)
  for (const variant of variants) {
    for (const size of sizesList) {
      await prisma.stock.upsert({
        where: {
          variant_id_size_id: {
            variant_id: variant.id,
            size_id: size.id,
          },
        },
        update: {},
        create: {
          variant_id: variant.id,
          size_id: size.id,
          quantity: 10,
        },
      });
    }
  }

  console.log("📦 Stock criado");

  let opCount = 1;

  const createOrder = async (
    variant: any,
    size: any,
    quantity_planned: number,
    quantity_produced: number,
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED",
  ) => {
    const isCompleted = status === "COMPLETED";

    await prisma.productionOrder.create({
      data: {
        id: `OP-2026-${String(opCount++).padStart(3, "0")}`,
        variant_id: variant.id,
        size_id: size.id,
        quantity_planned,
        quantity_produced,
        status,
        start_date:
          status !== "PLANNED" ? new Date(Date.now() - 86400000) : null,
        end_date: isCompleted ? new Date() : null,
      },
    });
  };

  // 🔥 IN PROGRESS (realista)
  for (let i = 0; i < 6; i++) {
    const variant = variants[i];
    const size = sizesList[i % sizesList.length];

    await createOrder(variant, size, 50, 20, "IN_PROGRESS");
  }

  // 🟡 PLANNED
  await createOrder(variants[6], sizesList[0], 40, 0, "PLANNED");

  // 🟢 COMPLETED
  for (let i = 7; i < 12; i++) {
    const variant = variants[i];
    const size = sizesList[i % sizesList.length];

    await createOrder(variant, size, 30, 30, "COMPLETED");
  }

  console.log("🏭 ProductionOrders criadas");

  console.log("✅ SEED FINALIZADO COM SUCESSO");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());