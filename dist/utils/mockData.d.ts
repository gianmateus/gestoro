interface RestaurantMockData {
    accounts: {
        payable: any[];
        receivable: any[];
    };
    inventory: any[];
    purchases: any[];
    events: any[];
    staff: any[];
    stats: {
        dailyRevenue: number;
        orders: number;
        appointments: number;
        weeklyProfit: number;
    };
}
export declare const getRestaurantMockData: (restaurantId: string) => RestaurantMockData | null;
export declare const getRestaurantStats: (restaurantId: string) => {
    dailyRevenue: number;
    orders: number;
    appointments: number;
    weeklyProfit: number;
};
export declare const getRestaurantAccounts: (restaurantId: string) => {
    payable: any[];
    receivable: any[];
};
export declare const getRestaurantInventory: (restaurantId: string) => any[];
export declare const getRestaurantPurchases: (restaurantId: string) => any[];
export declare const getRestaurantEvents: (restaurantId: string) => any[];
export declare const getRestaurantStaff: (restaurantId: string) => any[];
export declare const getAllRestaurantsStats: () => {
    id: string;
    stats: {
        dailyRevenue: number;
        orders: number;
        appointments: number;
        weeklyProfit: number;
    };
}[];
export declare const getFinancialSummary: (restaurantId: string) => {
    dailyRevenue: number;
    orders: number;
    appointments: number;
    weeklyProfit: number;
    totalPayable: any;
    totalReceivable: any;
    inventoryValue: any;
    netCashFlow: number;
};
export {};
//# sourceMappingURL=mockData.d.ts.map