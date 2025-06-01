import { useEffect, useCallback, useRef } from 'react';
import { eventBus, EventType, EventPayload } from '../utils/eventBus';

// Hook para usar o EventBus em componentes React
export function useEventBus() {
  const listenersRef = useRef<(() => void)[]>([]);

  // Função para se inscrever em um evento
  const on = useCallback(<T extends EventType>(
    event: T,
    listener: (payload: EventPayload[T]) => void
  ) => {
    const unsubscribe = eventBus.on(event, listener);
    listenersRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  // Função para emitir um evento
  const emit = useCallback(<T extends EventType>(
    event: T,
    payload: EventPayload[T]
  ) => {
    eventBus.emit(event, payload);
  }, []);

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      // Remove todos os listeners quando o componente desmonta
      listenersRef.current.forEach(unsubscribe => unsubscribe());
      listenersRef.current = [];
    };
  }, []);

  return { on, emit };
}

// Hook para escutar um evento específico
export function useEventListener<T extends EventType>(
  event: T,
  listener: (payload: EventPayload[T]) => void,
  deps: React.DependencyList = []
) {
  const { on } = useEventBus();

  useEffect(() => {
    const unsubscribe = on(event, listener);
    return unsubscribe;
  }, [event, ...deps]);
}

// Hook para emitir eventos facilmente
export function useEventEmitter() {
  const { emit } = useEventBus();

  const emitSuccess = useCallback((message: string, component: string) => {
    emit('SUCCESS_MESSAGE', { message, component });
  }, [emit]);

  const emitError = useCallback((error: string, component: string) => {
    emit('ERROR_OCCURRED', { error, component });
  }, [emit]);

  const emitWarning = useCallback((message: string, component: string) => {
    emit('WARNING_MESSAGE', { message, component });
  }, [emit]);

  const emitInfo = useCallback((message: string, component: string) => {
    emit('INFO_MESSAGE', { message, component });
  }, [emit]);

  const emitEmployeeCreated = useCallback((employee: any) => {
    emit('EMPLOYEE_CREATED', { employee });
  }, [emit]);

  const emitEmployeeUpdated = useCallback((employee: any) => {
    emit('EMPLOYEE_UPDATED', { employee });
  }, [emit]);

  const emitEmployeeScheduleUpdated = useCallback((employeeId: string, schedule: any) => {
    emit('EMPLOYEE_SCHEDULE_UPDATED', { employeeId, schedule });
  }, [emit]);

  const emitFinancialAccountCreated = useCallback((account: any) => {
    emit('FINANCIAL_ACCOUNT_CREATED', { account });
  }, [emit]);

  const emitRecurringPaymentCreated = useCallback((payment: any) => {
    emit('RECURRING_PAYMENT_CREATED', { payment });
  }, [emit]);

  const emitCalendarEventCreated = useCallback((event: any) => {
    emit('CALENDAR_EVENT_CREATED', { event });
  }, [emit]);

  const emitRecurringEventCreated = useCallback((event: any) => {
    emit('RECURRING_EVENT_CREATED', { event });
  }, [emit]);

  const emitInventoryUpdated = useCallback((item: any) => {
    emit('INVENTORY_ITEM_UPDATED', { item });
  }, [emit]);

  const emitInventoryLowStock = useCallback((item: any) => {
    emit('INVENTORY_LOW_STOCK', { item });
  }, [emit]);

  const emitInventoryRestock = useCallback((itemId: string, quantity: number) => {
    emit('INVENTORY_RESTOCK', { itemId, quantity });
  }, [emit]);

  const emitPurchaseOrderCreated = useCallback((order: any) => {
    emit('PURCHASE_ORDER_CREATED', { order });
  }, [emit]);

  const emitPurchaseOrderCompleted = useCallback((orderId: string) => {
    emit('PURCHASE_ORDER_COMPLETED', { orderId });
  }, [emit]);

  const emitDeliveryReceived = useCallback((orderId: string, items: any[]) => {
    emit('DELIVERY_RECEIVED', { orderId, items });
  }, [emit]);

  const emitRestaurantSelected = useCallback((restaurant: any) => {
    emit('RESTAURANT_SELECTED', { restaurant });
  }, [emit]);

  const emitDashboardRefreshed = useCallback((restaurantId: string) => {
    emit('DASHBOARD_REFRESHED', { restaurantId });
  }, [emit]);

  const emitStatsUpdated = useCallback((stats: any) => {
    emit('STATS_UPDATED', { stats });
  }, [emit]);

  return {
    emit,
    emitSuccess,
    emitError,
    emitWarning,
    emitInfo,
    emitEmployeeCreated,
    emitEmployeeUpdated,
    emitEmployeeScheduleUpdated,
    emitFinancialAccountCreated,
    emitRecurringPaymentCreated,
    emitCalendarEventCreated,
    emitRecurringEventCreated,
    emitInventoryUpdated,
    emitInventoryLowStock,
    emitInventoryRestock,
    emitPurchaseOrderCreated,
    emitPurchaseOrderCompleted,
    emitDeliveryReceived,
    emitRestaurantSelected,
    emitDashboardRefreshed,
    emitStatsUpdated
  };
} 