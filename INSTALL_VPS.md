# Instalação em VPS (Servidor Linux)

## Pré-requisitos

- VPS com Ubuntu 20.04+ ou CentOS 8+ (recomendado: Ubuntu 22.04)
- Acesso root ou sudo
- Pelo menos 1GB RAM e 10GB disco

## Passo a Passo Completo

### 1. Atualizar Sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Instalar Node.js 18+

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PostgreSQL (Opcional)

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib -y
sudo postgresql-setup initdb

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuário
sudo -u postgres psql
ALTER USER postgres PASSWORD 'sua_senha_forte';
CREATE DATABASE seo_rewriter;
\q
```

### 4. Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2
```

### 5. Clonar e Configurar Projeto

```bash
# Navegar para diretório
cd /opt

# Clonar projeto
sudo git clone [URL_DO_SEU_REPOSITORIO] seo-rewriter
cd seo-rewriter

# Dar permissões
sudo chown -R $USER:$USER /opt/seo-rewriter

# Instalar dependências
npm install
```

### 6. Configurar Variáveis de Ambiente

```bash
# Criar arquivo de ambiente
cp .env.example .env

# Editar configurações
nano .env
```

Configurações para produção:
```
# APIs de IA
OPENAI_API_KEY=sua_chave_openai
GEMINI_API_KEY=sua_chave_gemini

# Banco de dados
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/seo_rewriter

# Ambiente
NODE_ENV=production

# Porta (opcional)
PORT=5000
```

### 7. Build da Aplicação

```bash
npm run build
```

### 8. Configurar PM2

```bash
# Criar arquivo de configuração PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'seo-rewriter',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Criar diretório de logs
mkdir -p logs

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save
pm2 startup
```

### 9. Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/seo-rewriter
```

Configuração do Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/seo-rewriter /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 10. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Teste renovação automática
sudo certbot renew --dry-run
```

### 11. Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Comandos de Manutenção

### PM2
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs seo-rewriter

# Reiniciar
pm2 restart seo-rewriter

# Parar
pm2 stop seo-rewriter

# Monitoramento
pm2 monit
```

### Atualizações
```bash
# Navegar para diretório
cd /opt/seo-rewriter

# Fazer backup
sudo cp -r /opt/seo-rewriter /opt/seo-rewriter-backup-$(date +%Y%m%d)

# Atualizar código
git pull

# Instalar dependências
npm install

# Rebuild
npm run build

# Reiniciar
pm2 restart seo-rewriter
```

### Logs e Monitoramento
```bash
# Logs do PM2
pm2 logs --lines 200

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Uso de recursos
htop
df -h
free -h
```

## Configurações de Segurança

### 1. Backup Automático
```bash
# Criar script de backup
sudo nano /opt/backup-seo.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -h localhost -U postgres seo_rewriter > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/seo-rewriter

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Dar permissão
sudo chmod +x /opt/backup-seo.sh

# Adicionar ao crontab
sudo crontab -e
# Adicionar linha: 0 2 * * * /opt/backup-seo.sh
```

### 2. Monitoramento de Recursos
```bash
# Instalar htop
sudo apt install htop -y

# Configurar alertas por email (opcional)
sudo apt install mailutils -y
```

### 3. Atualizações de Segurança
```bash
# Atualizações automáticas
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

## Solução de Problemas

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs seo-rewriter

# Verificar porta
netstat -tlnp | grep :5000

# Reiniciar serviços
pm2 restart all
sudo systemctl restart nginx
```

### Erro de banco de dados
```bash
# Verificar status PostgreSQL
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U postgres -d seo_rewriter

# Verificar logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Problemas de performance
```bash
# Monitorar recursos
htop
iotop
pm2 monit

# Otimizar PM2
pm2 reload seo-rewriter
```

## Arquitetura Recomendada para Produção

### Pequeno Tráfego (< 1000 usuários/dia)
- VPS: 2GB RAM, 2 CPU, 20GB SSD
- Banco: PostgreSQL no mesmo servidor
- CDN: Cloudflare (grátis)

### Médio Tráfego (1K-10K usuários/dia)
- VPS: 4GB RAM, 4 CPU, 40GB SSD
- Banco: PostgreSQL dedicado ou managed
- Load Balancer: Nginx
- Monitoramento: PM2 + logs centralizados

### Alto Tráfego (> 10K usuários/dia)
- Múltiplos servidores com load balancer
- Banco PostgreSQL gerenciado (AWS RDS, etc.)
- Redis para cache
- Monitoramento profissional (New Relic, DataDog)

## Suporte e Manutenção

Para manter o sistema funcionando:
1. Monitor logs diariamente
2. Backups automáticos configurados
3. Atualizações de segurança mensais
4. Monitoring de recursos
5. Documentar mudanças em produção