import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { MenuModule } from './modules/menu/menu.module.js';
import { SystemUserModule } from './modules/system/system-user/system-user.module.js';
import { SystemRoleModule } from './modules/system/system-role/system-role.module.js';
import { SystemMenuModule } from './modules/system/system-menu/system-menu.module.js';
import { SystemDeptModule } from './modules/system/system-dept/system-dept.module.js';
import { SystemDictModule } from './modules/system/system-dict/system-dict.module.js';
import { SystemConfigModule } from './modules/system/system-config/system-config.module.js';
import { SystemNoticeModule } from './modules/system/system-notice/system-notice.module.js';
import { SystemJobModule } from './modules/system/system-job/system-job.module.js';
import { SystemLogModule } from './modules/system/system-log/system-log.module.js';
import { OnlineModule } from './modules/online/online.module.js';
import { MonitorModule } from './modules/monitor/monitor.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { SystemMessageModule } from './modules/system/system-message/system-message.module.js';
import { SystemAttachmentModule } from './modules/system/system-attachment/system-attachment.module.js';
import { SystemAuditLogModule } from './modules/system/system-audit-log/system-audit-log.module.js';
import { SystemWorkflowModule } from './modules/system/system-workflow/system-workflow.module.js';

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
    SystemMessageModule,
    SystemAttachmentModule,
    SystemAuditLogModule,
    SystemWorkflowModule,
  ],
  providers: [],
})
export class AppModule {}
