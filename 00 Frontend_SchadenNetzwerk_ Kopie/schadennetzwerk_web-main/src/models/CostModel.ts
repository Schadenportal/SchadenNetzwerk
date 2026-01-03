class CostModel {
  total: number;

  workshopHourlyRate: number;

  workshopHourlyBilledRate: number;

  paintShopRate: number;

  paintShopBilledRate: number;

  damageId: string;

  costSummaryId: string;

  constructor(data: Record<string, any>) {
    this.total = data.total as number;
    this.workshopHourlyRate = data.workshopHourlyRate as number;
    this.workshopHourlyBilledRate = data.workshopHourlyBilledRate as number;
    this.paintShopRate = data.paintShopRate as number;
    this.paintShopBilledRate = data.paintShopBilledRate as number;
    this.damageId = data.damageId as string;
    this.costSummaryId = data.costSummaryId as string;

    Object.freeze(this);
  }
}

export default CostModel;
