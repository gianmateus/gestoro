import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createPersonalAdmin() {
  console.log('🔐 Criando administrador personalizado...');

  // Suas credenciais personalizadas
  const adminEmail = 'gianmateus22@icloud.com';
  const adminPassword = 'Nalutobias123!';
  const adminName = 'Gian Mateus - Admin Principal';

  try {
    // Verificar se já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('👤 Administrador personalizado já existe');
      console.log(`📧 Email: ${adminEmail}`);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Criar administrador personalizado
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

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createPersonalAdmin();
}

export { createPersonalAdmin }; 