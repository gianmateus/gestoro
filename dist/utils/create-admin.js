"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPersonalAdmin = createPersonalAdmin;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function createPersonalAdmin() {
    console.log('🔐 Criando administrador personalizado...');
    const adminEmail = 'gianmateus22@icloud.com';
    const adminPassword = 'Nalutobias123!';
    const adminName = 'Gian Mateus - Admin Principal';
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });
        if (existingAdmin) {
            console.log('👤 Administrador personalizado já existe');
            console.log(`📧 Email: ${adminEmail}`);
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: adminName,
                role: 'ADMIN',
                isActive: true
            }
        });
        console.log('✅ Administrador personalizado criado:');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔐 Senha: ${adminPassword}`);
        console.log(`👤 Nome: ${adminName}`);
        console.log(`🆔 ID: ${admin.id}`);
        console.log('\n🎉 Agora você pode fazer login com suas credenciais personalizadas!');
    }
    catch (error) {
        console.error('❌ Erro ao criar administrador:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    createPersonalAdmin();
}
//# sourceMappingURL=create-admin.js.map