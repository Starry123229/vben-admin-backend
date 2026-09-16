import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ServiceException } from '../../common/result';
import { comparePassword, hashPassword } from '../../common/utils/password';
import * as path from 'path';
import * as fs from 'fs';
import dayjs = require('dayjs');

/**
 * 用户服务（对标 Java 端 UserController + SysUserService）
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /** GET /user/info：返回脱敏用户信息 */
  async info(userId: bigint) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
    });

    if (!user) throw ServiceException.notFound('用户不存在');

    const roles = await this.authService.getRoleCodes(userId);

    return {
      id: user.id.toString(),
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      intro: user.intro,
      roles,
      homePath: user.homePath,
    };
  }

  /** POST /user/password：修改密码 */
  async changePassword(
    userId: bigint,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw ServiceException.badRequest('请填写完整的密码信息');
    }
    if (newPassword !== confirmPassword) {
      throw ServiceException.badRequest('两次输入的新密码不一致');
    }

    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw ServiceException.notFound('用户不存在');

    if (!(await comparePassword(oldPassword, user.passwordHash))) {
      throw ServiceException.badRequest('旧密码不正确');
    }

    const newHash = await hashPassword(newPassword);
    await this.prisma.sysUser.update({
      where: { id: userId },
      data: { passwordHash: newHash, updateTime: dayjs().toDate() },
    });
  }

  /** PUT /user/profile：更新基本资料 */
  async updateProfile(
    userId: bigint,
    realName: string,
    intro: string,
  ): Promise<void> {
    await this.prisma.sysUser.update({
      where: { id: userId },
      data: { realName, intro, updateTime: dayjs().toDate() },
    });
  }

  /** POST /user/avatar：上传头像 */
  async saveAvatar(userId: bigint, file: Express.Multer.File): Promise<string> {
    // 校验文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw ServiceException.badRequest('只支持 PNG/JPG/GIF/SVG 格式');
    }

    // 校验文件大小（≤5MB）
    if (file.size > 5 * 1024 * 1024) {
      throw ServiceException.badRequest('头像大小不能超过 5MB');
    }

    const ext = file.mimetype.split('/')[1];
    const fileName = `${userId}_${dayjs().format('YYYYMMDDHHmmss')}.${ext}`;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const avatarDir = path.join(uploadDir, 'avatar');

    // 确保目录存在
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }

    const filePath = path.join(avatarDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // 更新用户头像路径
    const avatarUrl = `/avatar/${fileName}`;
    await this.prisma.sysUser.update({
      where: { id: userId },
      data: { avatar: avatarUrl, updateTime: dayjs().toDate() },
    });

    return avatarUrl;
  }
}
