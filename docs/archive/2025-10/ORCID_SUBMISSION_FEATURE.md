# 📜 Sistema de Crédito via ORCID nas Submissões Oficiais ao HPO

## 🎯 Objetivo

Incluir o **ORCID iD** dos contribuidores nas submissões oficiais de traduções para o repositório da Human Phenotype Ontology, garantindo **reconhecimento acadêmico permanente** e aumentando o **engajamento** da comunidade.

---

## ✅ Como Funciona

### 1. **Captura do ORCID**
Já está implementado! Quando um usuário faz login com ORCID:
- O ORCID iD é armazenado no banco de dados (`users.orcidId`)
- Fica visível no perfil do usuário
- É usado para identificar contribuições

### 2. **Geração de Arquivo de Contribuidores**

Quando um **release** de traduções for submetido ao HPO oficial, o sistema gerará um arquivo `CONTRIBUTORS.md` contendo:

```markdown
# HPO Portuguese Translation Contributors

This translation was made possible by the following contributors from the RARAS-CPLP community:

## Lead Translators (ORCID)
- João Silva (https://orcid.org/0000-0002-1234-5678) - 250 translations
- Maria Santos (https://orcid.org/0000-0003-9876-5432) - 180 translations

## Reviewers (ORCID)
- Dr. Pedro Costa (https://orcid.org/0000-0001-2345-6789) - 120 reviews
- Dra. Ana Oliveira (https://orcid.org/0000-0004-8765-4321) - 95 reviews

## Validators (ORCID)
- Prof. Carlos Mendes (https://orcid.org/0000-0005-1111-2222) - 80 validations

Total Contributors: 25
Translation Period: October 2024 - December 2024
Platform: https://hpo.raras-cplp.org
```

### 3. **Formato Babelon com Metadados**

No arquivo `.tsv` oficial (formato Babelon), incluiremos um campo de metadados:

```tsv
defined_class	defined_class_label	translation	translation_language	translator_id	translator_orcid	translation_confidence	translation_status
HP:0000001	All	Todos	pt	user_123	0000-0002-1234-5678	5	APPROVED
HP:0000002	Abnormality	Anormalidade	pt	user_456	0000-0003-9876-5432	5	APPROVED
```

---

## 🚀 Implementação Backend

### Endpoint para Gerar Release com ORCIDs

```javascript
// routes/export.js

router.get('/export/release/babelon-with-credits', requireAuth, async (req, res) => {
  try {
    // 1. Buscar todas as traduções APROVADAS do período
    const translations = await Translation.findAll({
      where: {
        status: 'APPROVED',
        approvedAt: {
          [Op.between]: [releaseStartDate, releaseEndDate]
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'orcidId', 'role']
        },
        {
          model: Term,
          attributes: ['hpoId', 'labelEn']
        }
      ],
      order: [['approvedAt', 'ASC']]
    });

    // 2. Gerar arquivo Babelon com campo translator_orcid
    const babelonData = translations.map(t => ({
      defined_class: t.term.hpoId,
      defined_class_label: t.term.labelEn,
      translation: t.labelPt,
      translation_language: 'pt',
      translator_id: t.user.id,
      translator_name: t.user.name,
      translator_orcid: t.user.orcidId || 'N/A',
      translation_confidence: t.confidence,
      translation_status: t.status,
      approved_at: t.approvedAt
    }));

    // 3. Gerar estatísticas de contribuidores
    const contributorStats = await generateContributorStats(translations);

    // 4. Gerar arquivo CONTRIBUTORS.md
    const contributorsFile = generateContributorsMarkdown(contributorStats);

    // 5. Retornar ZIP com ambos os arquivos
    const zip = new JSZip();
    zip.file('hpo-pt-translations.tsv', generateTSV(babelonData));
    zip.file('CONTRIBUTORS.md', contributorsFile);
    zip.file('README.md', generateReleaseReadme(contributorStats));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=hpo-pt-release-${Date.now()}.zip`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Erro ao gerar release:', error);
    res.status(500).json({ error: 'Erro ao gerar release' });
  }
});

function generateContributorStats(translations) {
  const stats = {};

  translations.forEach(t => {
    const userId = t.user.id;
    if (!stats[userId]) {
      stats[userId] = {
        name: t.user.name,
        orcid: t.user.orcidId,
        role: t.user.role,
        translations: 0,
        firstContribution: t.createdAt,
        lastContribution: t.approvedAt
      };
    }
    stats[userId].translations++;
  });

  return Object.values(stats).sort((a, b) => b.translations - a.translations);
}

function generateContributorsMarkdown(stats) {
  let md = '# HPO Portuguese Translation Contributors\n\n';
  md += 'This translation was made possible by the following contributors from the RARAS-CPLP community:\n\n';
  
  // Agrupar por role
  const roles = {
    'SUPER_ADMIN': '## Project Coordinators (ORCID)\n',
    'ADMIN': '## Administrators (ORCID)\n',
    'MODERATOR': '## Moderators (ORCID)\n',
    'COMMITTEE_MEMBER': '## Committee Members (ORCID)\n',
    'VALIDATOR': '## Validators (ORCID)\n',
    'REVIEWER': '## Reviewers (ORCID)\n',
    'TRANSLATOR': '## Translators (ORCID)\n'
  };

  Object.keys(roles).forEach(role => {
    const contributors = stats.filter(s => s.role === role);
    if (contributors.length > 0) {
      md += roles[role];
      contributors.forEach(c => {
        const orcidLink = c.orcid ? `(https://orcid.org/${c.orcid})` : '(No ORCID)';
        md += `- ${c.name} ${orcidLink} - ${c.translations} translations\n`;
      });
      md += '\n';
    }
  });

  md += `\n**Total Contributors:** ${stats.length}\n`;
  md += `**Platform:** https://hpo.raras-cplp.org\n`;
  md += `**Project:** RARAS-CPLP Community Translation Initiative\n`;

  return md;
}
```

---

## 🎁 Benefícios

### Para os Contribuidores:
1. ✅ **Reconhecimento Acadêmico Permanente** - ORCID aparece no repositório oficial da HPO
2. ✅ **Citações Acadêmicas** - Contribuições podem ser referenciadas em papers
3. ✅ **Currículo Lattes/CV** - Comprovação de participação em projeto internacional
4. ✅ **Visibilidade Científica** - Nome associado ao projeto HPO global

### Para o Projeto:
1. 🚀 **Maior Engajamento** - Incentivo para contribuir mais
2. 🌍 **Transparência** - Comunidade sabe quem contribuiu
3. 📊 **Métricas** - Estatísticas de contribuição por pessoa
4. 🤝 **Credibilidade** - Reconhecimento oficial aumenta a seriedade do projeto

---

## 📅 Frequência de Releases

### Sugestão de Cronograma:

1. **Release Beta** (Dezembro 2024)
   - 500 termos essenciais traduzidos
   - Revisados e aprovados
   - Primeira submissão oficial ao HPO

2. **Release 1.0** (Março 2025)
   - 2.000 termos traduzidos
   - Sistema de revisão consolidado
   - Lista completa de contribuidores

3. **Releases Trimestrais** (após 1.0)
   - A cada 3 meses
   - Incrementos de ~1.000 termos
   - Atualização de contribuidores

4. **Release Final** (2026)
   - 16.000+ termos completos
   - Tradução completa da HPO
   - Reconhecimento de todos os contribuidores

---

## 📝 Mensagem na Landing Page

Já implementado na nova landing page:

> **📜 Crédito Oficial via ORCID**
>
> Seu ORCID iD será incluído nas submissões oficiais ao repositório HPO, 
> garantindo reconhecimento acadêmico permanente

---

## 🔧 Próximos Passos

1. ✅ Landing page atualizada com informações sobre ORCID
2. ⏳ Implementar endpoint de geração de release com ORCIDs (backend)
3. ⏳ Criar interface admin para gerar releases
4. ⏳ Documentar processo de submissão ao HPO oficial
5. ⏳ Definir critérios e datas para releases

---

## 📞 Contato com HPO Oficial

Para submeter traduções oficialmente:
- **GitHub:** https://github.com/obophenotype/human-phenotype-ontology
- **Email:** hpo@monarchinitiative.org
- **Processo:** Pull Request no repositório oficial com:
  - Arquivo `.tsv` no formato Babelon
  - `CONTRIBUTORS.md` com ORCIDs
  - Documentação do processo de tradução

---

**🎯 Objetivo Final:** Tornar a plataforma HPO-PT a referência oficial de tradução lusófona, 
com reconhecimento acadêmico permanente para todos os contribuidores via ORCID.
