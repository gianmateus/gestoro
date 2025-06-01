// Sistema de EventBus para comunicação entre componentes
export interface EventPayload {
  // Restaurant Events
  RESTAURANT_SELECTED: { restaurant: any };
  RESTAURANT_CREATED: { restaurant: any };
  RESTAURANT_UPDATED: { restaurant: any };
  RESTAURANT_DELETED: { restaurantId: string };

  // Employee Events
  EMPLOYEE_CREATED: { employee: any };
  EMPLOYEE_UPDATED: { employee: any };
  EMPLOYEE_DELETED: { employeeId: string };
  EMPLOYEE_STATUS_CHANGED: { employeeId: string; status: string };
  EMPLOYEE_SCHEDULE_UPDATED: { employeeId: string; schedule: any };

  // Financial Events
  FINANCIAL_ACCOUNT_CREATED: { account: any };
  FINANCIAL_ACCOUNT_UPDATED: { account: any };
  FINANCIAL_ACCOUNT_DELETED: { accountId: string };
  FINANCIAL_ACCOUNT_PAID: { accountId: string; amount: number };
  RECURRING_PAYMENT_CREATED: { payment: any };
  RECURRING_PAYMENT_UPDATED: { payment: any };

  // Inventory Events
  INVENTORY_ITEM_CREATED: { item: any };
  INVENTORY_ITEM_UPDATED: { item: any };
  INVENTORY_ITEM_DELETED: { itemId: string };
  INVENTORY_LOW_STOCK: { item: any };
  INVENTORY_RESTOCK: { itemId: string; quantity: number };

  // Calendar Events
  CALENDAR_EVENT_CREATED: { event: any };
  CALENDAR_EVENT_UPDATED: { event: any };
  CALENDAR_EVENT_DELETED: { eventId: string };
  RECURRING_EVENT_CREATED: { event: any };

  // Shopping/Purchase Events
  PURCHASE_ORDER_CREATED: { order: any };
  PURCHASE_ORDER_UPDATED: { order: any };
  PURCHASE_ORDER_COMPLETED: { orderId: string };
  PURCHASE_ORDER_CANCELLED: { orderId: string };
  ITEMS_ORDERED: { items: any[] };
  DELIVERY_RECEIVED: { orderId: string; items: any[] };

  // Settings Events
  SETTINGS_UPDATED: { section: string; settings: any };
  USER_PREFERENCES_UPDATED: { preferences: any };
  SYSTEM_CONFIG_CHANGED: { config: any };

  // Notification Events
  NOTIFICATION_CREATED: { notification: any };
  NOTIFICATION_READ: { notificationId: string };
  ALERT_CREATED: { alert: any };
  REMINDER_SET: { reminder: any };

  // Dashboard Events
  DASHBOARD_REFRESHED: { restaurantId: string };
  STATS_UPDATED: { stats: any };

  // System Events
  DATA_SYNC_STARTED: {};
  DATA_SYNC_COMPLETED: {};
  DATA_SYNC_FAILED: { error: string };
  ERROR_OCCURRED: { error: string; component: string };
  SUCCESS_MESSAGE: { message: string; component: string };
  WARNING_MESSAGE: { message: string; component: string };
  INFO_MESSAGE: { message: string; component: string };

  // Authentication Events
  USER_LOGGED_IN: { user: any };
  USER_LOGGED_OUT: {};
  SESSION_EXPIRED: {};
}

export type EventType = keyof EventPayload;

type EventListener<T extends EventType> = (payload: EventPayload[T]) => void;

class EventBus {
  private listeners: { [K in EventType]?: EventListener<K>[] } = {};
  private history: Array<{ event: EventType; payload: any; timestamp: Date }> = [];
  private debug: boolean = process.env.NODE_ENV === 'development';

  // Subscribe to an event
  on<T extends EventType>(event: T, listener: EventListener<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener as any);

    if (this.debug) {
      console.log(`🔗 EventBus: Listener adicionado para "${event}". Total: ${this.listeners[event]!.length}`);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, listener);
    };
  }

  // Unsubscribe from an event
  off<T extends EventType>(event: T, listener: EventListener<T>): void {
    if (!this.listeners[event]) return;

    const index = this.listeners[event]!.indexOf(listener as any);
    if (index > -1) {
      this.listeners[event]!.splice(index, 1);
      if (this.debug) {
        console.log(`🔗 EventBus: Listener removido de "${event}". Total: ${this.listeners[event]!.length}`);
      }
    }
  }

  // Emit an event
  emit<T extends EventType>(event: T, payload: EventPayload[T]): void {
    if (this.debug) {
      console.log(`🚀 EventBus: Emitindo evento "${event}"`, payload);
    }

    // Add to history
    this.history.push({
      event,
      payload,
      timestamp: new Date()
    });

    // Keep only last 100 events
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Notify all listeners
    if (this.listeners[event]) {
      this.listeners[event]!.forEach((listener, index) => {
        try {
          listener(payload);
          if (this.debug) {
            console.log(`✅ EventBus: Listener ${index + 1} processou "${event}" com sucesso`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar evento "${event}" no listener ${index + 1}:`, error);
        }
      });
    } else if (this.debug) {
      console.warn(`⚠️ EventBus: Nenhum listener encontrado para evento "${event}"`);
    }
  }

  // Get event history
  getHistory(): Array<{ event: EventType; payload: any; timestamp: Date }> {
    return [...this.history];
  }

  // Clear all listeners
  removeAllListeners(): void {
    this.listeners = {};
    if (this.debug) {
      console.log('🧹 EventBus: Todos os listeners removidos');
    }
  }

  // Get active listeners count
  getListenersCount(): number {
    return Object.values(this.listeners).reduce((count, listeners) => count + (listeners?.length || 0), 0);
  }

  // Debug methods
  getStats() {
    return {
      totalListeners: this.getListenersCount(),
      eventsInHistory: this.history.length,
      listenersByEvent: Object.fromEntries(
        Object.entries(this.listeners).map(([event, listeners]) => [event, listeners?.length || 0])
      )
    };
  }

  enableDebug() {
    this.debug = true;
    console.log('🐛 EventBus: Debug mode habilitado');
  }

  disableDebug() {
    this.debug = false;
    console.log('🐛 EventBus: Debug mode desabilitado');
  }
}

// Global EventBus instance
export const eventBus = new EventBus();

// Expose eventBus globally for development debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).eventBus = eventBus;
  console.log('🐛 EventBus disponível globalmente como window.eventBus para debug');
  console.log('🐛 Use eventBus.getStats() para ver estatísticas');
  console.log('🐛 Use eventBus.getHistory() para ver histórico de eventos');
}

// Helper functions for common events
export const emitRestaurantSelected = (restaurant: any) => 
  eventBus.emit('RESTAURANT_SELECTED', { restaurant });

export const emitEmployeeCreated = (employee: any) => 
  eventBus.emit('EMPLOYEE_CREATED', { employee });

export const emitEmployeeUpdated = (employee: any) => 
  eventBus.emit('EMPLOYEE_UPDATED', { employee });

export const emitFinancialAccountCreated = (account: any) => 
  eventBus.emit('FINANCIAL_ACCOUNT_CREATED', { account });

export const emitCalendarEventCreated = (event: any) => 
  eventBus.emit('CALENDAR_EVENT_CREATED', { event });

export const emitInventoryItemUpdated = (item: any) => 
  eventBus.emit('INVENTORY_ITEM_UPDATED', { item });

export const emitSuccessMessage = (message: string, component: string) => 
  eventBus.emit('SUCCESS_MESSAGE', { message, component });

export const emitErrorOccurred = (error: string, component: string) => 
  eventBus.emit('ERROR_OCCURRED', { error, component }); 