import { prisma } from "@/lib/prisma";
import { ParentsClient } from "./parents-client";

async function getParents() {
  return prisma.parent.findMany({
    include: { students: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ParentsPage() {
  const parents = await getParents();
  return <ParentsClient initialParents={parents} />;
}
