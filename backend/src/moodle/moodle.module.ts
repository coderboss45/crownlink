import { Module } from "@nestjs/common";
import { MoodleService } from "./moodle.service";

import { MoodleLaunchController } from './launch.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({ providers: [MoodleService, PrismaService], exports: [MoodleService], controllers: [MoodleLaunchController] })
export class MoodleModule {}
