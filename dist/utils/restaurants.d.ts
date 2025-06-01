export declare const getRestaurantsForUser: (userId: string) => Promise<{
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    phone: string | null;
    description: string | null;
    address: string;
    logo: string | null;
    color: string | null;
    ownerId: string;
}[]>;
export declare const getRestaurantById: (restaurantId: string, userId: string) => Promise<{
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    phone: string | null;
    description: string | null;
    address: string;
    logo: string | null;
    color: string | null;
    ownerId: string;
}>;
export declare const createRestaurant: (restaurantData: {
    name: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
    color?: string;
}, userId: string) => Promise<{
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    phone: string | null;
    description: string | null;
    address: string;
    logo: string | null;
    color: string | null;
    ownerId: string;
}>;
export declare const updateRestaurantData: (restaurantId: string, updateData: {
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    color?: string;
}, userId: string) => Promise<{
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    phone: string | null;
    description: string | null;
    address: string;
    logo: string | null;
    color: string | null;
    ownerId: string;
}>;
export declare const deleteRestaurant: (restaurantId: string, userId: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const validateRestaurantAccess: (restaurantId: string, userId: string) => Promise<boolean>;
//# sourceMappingURL=restaurants.d.ts.map