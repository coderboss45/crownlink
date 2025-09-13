import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { StripeModule } from "./stripe/stripe.module";
import { PostmarkModule } from "./postmark/postmark.module";
import { MoodleModule } from "./moodle/moodle.module";
import { EmployerModule } from "./employer/employer.module";
import { CoursesModule } from "./courses/courses.module";
import { AdminModule } from "./admin/admin.module";
import { PaymentsController } from "./payments/payments.controller";
import { EnrollmentsController } from "./enrollments/enrollments.controller";

@Module({
  imports: [
    UsersModule,
    AuthModule,
    StripeModule,
    PostmarkModule,
    MoodleModule,
    EmployerModule,
    CoursesModule,
    AdminModule,
  ],
  providers: [PrismaService],
  controllers: [PaymentsController, EnrollmentsController],
})
export class AppModule {}
