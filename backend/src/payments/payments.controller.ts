import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller("payments")
export class PaymentsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get("")
  async list(@Req() req: any) {
    const user = req.user;
    if (user.role === "admin") {
      return this.prisma.payment.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    }
    return this.prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }
}
