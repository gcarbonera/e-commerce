# 🔧 Comandos Git para Deploy

## 📦 Inicialização do Repositório

### 1. Verificar se Git está instalado
```powershell
git --version
```

Se não estiver instalado, baixe em: https://git-scm.com/download/win

---

## 🚀 Setup Inicial

### 2. Configurar usuário Git (se primeira vez)
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 3. Inicializar repositório
```powershell
cd "C:\Users\Guilherme\Desktop\Trabalho Programação Web"
git init
```

### 4. Adicionar todos os arquivos
```powershell
git add .
```

### 5. Verificar arquivos que serão commitados
```powershell
git status
```

### 6. Fazer commit inicial
```powershell
git commit -m "feat: e-commerce ready for Render deploy"
```

---

## 🌐 Conectar ao GitHub

### 7. Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `ecommerce-frontend` (ou outro nome)
3. Visibilidade: **Público** ou **Privado**
4. **NÃO** marque "Add a README file"
5. **NÃO** marque "Add .gitignore"
6. Clique em "Create repository"

### 8. Copiar URL do repositório
Exemplo: `https://github.com/SEU_USUARIO/ecommerce-frontend.git`

### 9. Conectar repositório local ao GitHub
```powershell
git remote add origin https://github.com/SEU_USUARIO/ecommerce-frontend.git
```

### 10. Renomear branch para main (se necessário)
```powershell
git branch -M main
```

### 11. Enviar código para GitHub
```powershell
git push -u origin main
```

---

## 🔄 Atualizações Futuras

Após fazer alterações no código:

```powershell
# Ver arquivos modificados
git status

# Adicionar arquivos modificados
git add .

# Fazer commit com mensagem descritiva
git commit -m "descrição das alterações"

# Enviar para GitHub (dispara redeploy no Render)
git push origin main
```

---

## 📝 Verificações Úteis

### Verificar repositório remoto
```powershell
git remote -v
```

### Verificar histórico de commits
```powershell
git log --oneline
```

### Verificar status atual
```powershell
git status
```

### Ver diferenças antes de commitar
```powershell
git diff
```

---

## ❌ Problemas Comuns

### Erro: "remote origin already exists"
```powershell
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU_USUARIO/REPO.git
```

### Erro: "Permission denied"
```powershell
# Usar HTTPS em vez de SSH
git remote set-url origin https://github.com/SEU_USUARIO/REPO.git

# Ou configurar SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### Erro: "failed to push"
```powershell
# Forçar push (CUIDADO: sobrescreve histórico remoto)
git push -f origin main

# Ou pull primeiro e depois push
git pull origin main --allow-unrelated-histories
git push origin main
```

### Desfazer último commit (mantendo alterações)
```powershell
git reset --soft HEAD~1
```

### Desfazer alterações não commitadas
```powershell
git checkout -- .
```

---

## 🔐 Autenticação GitHub

### Token de Acesso Pessoal (PAT)

Se o GitHub pedir senha, você precisa usar um Personal Access Token:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Nome: `Render Deploy Token`
4. Selecione: `repo` (Full control of private repositories)
5. Clique em "Generate token"
6. **Copie o token** (você não poderá ver novamente!)
7. Use o token como senha quando o Git pedir

### Salvar credenciais (opcional)
```powershell
# Windows Credential Manager salvará automaticamente
git config --global credential.helper wincred
```

---

## 📊 Fluxo Completo

```powershell
# 1. Inicializar e fazer commit inicial
cd "C:\Users\Guilherme\Desktop\Trabalho Programação Web"
git init
git add .
git commit -m "feat: e-commerce ready for Render deploy"

# 2. Conectar ao GitHub
git remote add origin https://github.com/SEU_USUARIO/ecommerce-frontend.git
git branch -M main
git push -u origin main

# 3. Fazer alterações (exemplo)
# ... editar arquivos ...
git add .
git commit -m "fix: corrigir layout da página de produtos"
git push origin main
```

---

## 📋 Checklist Git

- [ ] Git instalado
- [ ] Usuário configurado (`git config --global`)
- [ ] Repositório inicializado (`git init`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Commit inicial feito (`git commit`)
- [ ] Repositório criado no GitHub
- [ ] Remote configurado (`git remote add origin`)
- [ ] Código enviado (`git push -u origin main`)
- [ ] Repositório visível no GitHub

---

## 🎯 Próximo Passo

Após push para GitHub:
1. Acesse: https://dashboard.render.com/select-repo?type=static
2. Conecte o repositório
3. Configure e faça deploy!

---

## 📚 Recursos

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Render Deploy Guide](https://render.com/docs/deploy-create-react-app)

---

**💡 Dica:** Copie e cole os comandos um por um no PowerShell, verificando o resultado de cada comando antes de prosseguir.
