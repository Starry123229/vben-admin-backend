import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service.js';
import { R } from '../../common/result.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('菜单')
@ApiBearerAuth('JWT')
@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /** GET /menu/all：当前用户授权路由树 */
  @Get('all')
  @ApiOperation({ summary: '当前用户路由树' })
  async all(@CurrentUser('id') userId: string) {
    return R.ok(await this.menuService.buildRoutesByUserId(BigInt(userId)));
  }
}
