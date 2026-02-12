import * as fs from 'fs';

export interface TaskMetric {
  taskId: string;
  agentId: string;
  model: string;
  duration: number;
  success: boolean;
  timestamp: number;
  retries?: number;
  error?: string;
}

export interface AgentStats {
  agentId: string;
  completed: number;
  failed: number;
  totalDuration: number;
  avgDuration: number;
  successRate: number;
}

export interface MetricsSummary {
  totalTasks: number;
  completed: number;
  failed: number;
  successRate: number;
  avgDuration: number;
  totalDuration: number;
  agentCount: number;
}

export class MetricsCollector {
  private records: TaskMetric[] = [];

  recordTask(metric: TaskMetric): void {
    this.records.push({ ...metric });
  }

  getSummary(): MetricsSummary {
    const total = this.records.length;
    if (total === 0) {
      return {
        totalTasks: 0,
        completed: 0,
        failed: 0,
        successRate: 0,
        avgDuration: 0,
        totalDuration: 0,
        agentCount: 0,
      };
    }

    const completed = this.records.filter((r) => r.success).length;
    const failed = total - completed;
    const totalDuration = this.records.reduce((sum, r) => sum + r.duration, 0);
    const uniqueAgents = new Set(this.records.map((r) => r.agentId));

    return {
      totalTasks: total,
      completed,
      failed,
      successRate: completed / total,
      avgDuration: totalDuration / total,
      totalDuration,
      agentCount: uniqueAgents.size,
    };
  }

  getAgentStats(agentId: string): AgentStats {
    const agentRecords = this.records.filter((r) => r.agentId === agentId);
    const completed = agentRecords.filter((r) => r.success).length;
    const failed = agentRecords.length - completed;
    const totalDuration = agentRecords.reduce((sum, r) => sum + r.duration, 0);

    return {
      agentId,
      completed,
      failed,
      totalDuration,
      avgDuration: agentRecords.length > 0 ? totalDuration / agentRecords.length : 0,
      successRate: agentRecords.length > 0 ? completed / agentRecords.length : 0,
    };
  }

  getRecords(): TaskMetric[] {
    return [...this.records];
  }

  async save(filePath: string): Promise<void> {
    const data = JSON.stringify(this.records, null, 2);
    await fs.promises.writeFile(filePath, data, 'utf-8');
  }

  async load(filePath: string): Promise<void> {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    this.records = JSON.parse(data);
  }

  clear(): void {
    this.records = [];
  }
}
