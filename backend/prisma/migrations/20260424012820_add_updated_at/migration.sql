/*
  Warnings:

  - You are about to drop the column `model_id` on the `ProductionOrder` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `ProductionOrder` table. All the data in the column will be lost.
  - Added the required column `size_id` to the `ProductionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ProductionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `ProductionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ShoeModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "ProductionOrder" DROP CONSTRAINT "ProductionOrder_model_id_fkey";

-- AlterTable
ALTER TABLE "ProductionOrder" DROP COLUMN "model_id",
DROP COLUMN "size",
ADD COLUMN     "size_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShoeModel" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ShoeVariant" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sole_color" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoeVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "size_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShoeVariant_sku_key" ON "ShoeVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Size_value_key" ON "Size"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_variant_id_size_id_key" ON "Stock"("variant_id", "size_id");

-- AddForeignKey
ALTER TABLE "ShoeVariant" ADD CONSTRAINT "ShoeVariant_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ShoeModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ShoeVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ShoeVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
