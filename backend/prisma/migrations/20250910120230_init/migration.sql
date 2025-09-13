/*
  Warnings:

  - The primary key for the `OAuthClient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OAuthClient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OAuthClient` table. All the data in the column will be lost.
  - Added the required column `grantTypes` to the `OAuthClient` table without a default value. This is not possible if the table is not empty.
  - Made the column `redirectUris` on table `OAuthClient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "OAuthClient_clientId_key";

-- AlterTable
ALTER TABLE "AuthorizationCode" ADD COLUMN     "codeChallenge" TEXT,
ADD COLUMN     "codeChallengeMethod" TEXT;

-- AlterTable
ALTER TABLE "OAuthClient" DROP CONSTRAINT "OAuthClient_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "grantTypes" JSONB NOT NULL,
ALTER COLUMN "clientSecret" DROP NOT NULL,
ALTER COLUMN "redirectUris" SET NOT NULL,
ADD CONSTRAINT "OAuthClient_pkey" PRIMARY KEY ("clientId");
