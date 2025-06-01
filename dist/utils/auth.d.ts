export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
export declare const authenticateUser: (email: string, password: string) => Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const generateToken: (user: {
    id: string;
    email: string;
    role: string;
}) => string;
export declare const verifyToken: (token: string) => {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
};
export declare const getAllUsers: () => Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const generatePasswordHash: (password: string) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map