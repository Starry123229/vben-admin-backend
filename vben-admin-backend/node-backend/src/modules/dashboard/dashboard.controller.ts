import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { R } from '../../common/result.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('仪表盘')
@ApiBearerAuth('JWT')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: '概览统计' })
  async overview() {
    return R.ok(await this.dashboardService.overview());
  }

  @Get('user-trends')
  @ApiOperation({ summary: '用户增长趋势' })
  async userTrends() {
    return R.ok(await this.dashboardService.userTrends());
  }

  @Get('role-distribution')
  @ApiOperation({ summary: '角色分布' })
  async roleDistribution() {
    return R.ok(await this.dashboardService.roleDistribution());
  }

  @Get('dept-distribution')
  @ApiOperation({ summary: '部门用户分布' })
  async deptDistribution() {
    return R.ok(await this.dashboardService.deptDistribution());
  }

  @Get('browser-distribution')
  @ApiOperation({ summary: '浏览器分布' })
  async browserDistribution() {
    return R.ok(await this.dashboardService.browserDistribution());
  }
}
