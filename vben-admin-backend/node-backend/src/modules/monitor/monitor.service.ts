import { Injectable } from '@nestjs/common';
import os from 'os';
import process from 'process';

@Injectable()
export class MonitorService {
  /** 服务器监控信息 */
  async serverInfo(): Promise<any> {
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      jvm: {
        maxMemory: mem.rss,
        totalMemory: mem.heapTotal,
        freeMemory: mem.heapUsed - mem.external,
        usedMemory: mem.heapUsed,
        startTime: Date.now() - process.uptime() * 1000,
        uptime: process.uptime() * 1000,
        jvmName: 'Node.js',
        jvmVersion: process.version,
        javaVersion: process.version,
      },
      sys: {
        osName: os.type(),
        osArch: os.arch(),
        osVersion: os.release(),
        processors: os.cpus().length,
        userDir: process.cwd(),
        hostname: os.hostname(),
        loadAverage: os.loadavg(),
      },
      cpu: {
        name: os.cpus()[0]?.model || 'Unknown',
        logicalCores: os.cpus().length,
        physicalCores: os.cpus().length,
        systemLoad: ((os.loadavg()[0] || 0) / os.cpus().length * 100).toFixed(2),
      },
      memory: {
        total: totalMem.toString(),
        available: freeMem.toString(),
        used: usedMem.toString(),
        usageRate: ((usedMem / totalMem) * 100).toFixed(2),
      },
    };
  }
}
