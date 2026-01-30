
export const PRICING = {
  MIN_VALUE_PER_PACKAGE: 10.00,
  FREE_KM_RADIUS: 20,
  EXTRA_KM_PRICE: 1.00,
  PLATFORM_FEE_PERCENTAGE: 0.15, // 15% platform fee
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  WAITING: 'Aguardando Entregador',
  ACCEPTED: 'Aceito',
  PICKING_UP: 'Em Coleta',
  COLLECTED: 'Coletado',
  IN_TRANSIT: 'Em Rota de Entrega',
  DELIVERED: 'Entregue',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado'
};

export const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-yellow-500',
  ACCEPTED: 'bg-blue-500',
  PICKING_UP: 'bg-indigo-500',
  COLLECTED: 'bg-purple-500',
  IN_TRANSIT: 'bg-orange-500',
  DELIVERED: 'bg-green-500',
  FINISHED: 'bg-gray-500',
  CANCELLED: 'bg-red-500'
};
