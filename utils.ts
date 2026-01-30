
import { PRICING } from './constants';

export const calculateFreight = (packageCount: number, distanceKm: number) => {
  const baseValue = packageCount * PRICING.MIN_VALUE_PER_PACKAGE;
  const extraKm = Math.max(0, distanceKm - PRICING.FREE_KM_RADIUS);
  const extraValue = extraKm * PRICING.EXTRA_KM_PRICE;
  
  const totalValue = baseValue + extraValue;
  const courierEarnings = totalValue * (1 - PRICING.PLATFORM_FEE_PERCENTAGE);
  
  return {
    totalValue,
    courierEarnings,
    baseValue,
    extraValue
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
