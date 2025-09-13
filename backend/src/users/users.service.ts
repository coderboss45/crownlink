import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User, Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    username: string,
    email: string,
    password: string,
    name?: string,
    role: Role = Role.learner
  ): Promise<User> {
    return this.prisma.user.create({
      data: { username, email, password, name, role },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async listAll() {
    return this.prisma.user.findMany();
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });
  }
}
