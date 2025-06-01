import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Verificando seed de produção...');

  // Verificar se já existe algum usuário admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('✅ Sistema já possui administrador configurado');
    console.log('📧 Admin encontrado:', existingAdmin.email);
    console.log('🎉 Sistema pronto para uso!');
    return;
  }

  console.log('⚠️  ATENÇÃO: Nenhum administrador encontrado!');
  console.log('');
  console.log('🔧 Para configurar o sistema, execute:');
  console.log('   node src/utils/create-admin.ts');
  console.log('');
  console.log('📋 Ou crie manualmente um usuário ADMIN no banco de dados.');
  console.log('');
  console.log('🚨 O sistema não funcionará corretamente sem um administrador!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed de produção:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 