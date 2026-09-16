import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MenuModule } from './modules/menu/menu.module';
import { SystemUserModule } from './modules/system/system-user/system-user.module';
import { SystemRoleModule } from './modules/system/system-role/system-role.module';
import { SystemMenuModule } from './modules/system/system-menu/system-menu.module';
import { SystemDeptModule } from './modules/system/system-dept/system-dept.module';
import { SystemDictModule } from './modules/system/system-dict/system-dict.module';
import { SystemConfigModule } from './modules/system/system-config/system-config.module';
import { SystemNoticeModule } from './modules/system/system-notice/system-notice.module';
import { SystemJobModule } from './modules/system/system-job/system-job.module';
import { SystemLogModule } from './modules/system/system-log/system-log.module';
import { OnlineModule } from './modules/online/online.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    MenuModule,
    SystemUserModule,
    SystemRoleModule,
    SystemMenuModule,
    SystemDeptModule,
    SystemDictModule,
    SystemConfigModule,
    SystemNoticeModule,
    SystemJobModule,
    SystemLogModule,
    OnlineModule,
    MonitorModule,
    DashboardModule,
  ],
  providers: [],
})
export class AppModule {}
