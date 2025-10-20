import React from 'react';

interface GuidelinesPageProps {
  onBack: () => void;
}

export const GuidelinesPage: React.FC<GuidelinesPageProps> = ({ onBack }) => {
  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '32px',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          ← Voltar
        </button>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          margin: 0
        }}>
          📖 Diretrizes de Tradução HPO
        </h1>
      </div>

      {/* Introduction */}
      <section style={{ 
        backgroundColor: '#eff6ff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '32px',
        borderLeft: '4px solid #3b82f6'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>
          🎯 Objetivo
        </h2>
        <p style={{ margin: '8px 0', lineHeight: '1.6', color: '#1f2937' }}>
          Estas diretrizes garantem traduções consistentes, precisas e de alta qualidade 
          dos termos da Human Phenotype Ontology (HPO) para o português brasileiro.
        </p>
      </section>

      {/* Princípios Fundamentais */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#1f2937',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          ✨ Princípios Fundamentais
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GuidelineCard
            icon="🎯"
            title="1. Precisão Médica"
            description="Mantenha a precisão terminológica médica. Use termos consagrados pela SBGM e literatura médica brasileira."
            example="✅ 'Hipertrofia ventricular esquerda' ❌ 'Coração grande do lado esquerdo'"
          />
          
          <GuidelineCard
            icon="🌐"
            title="2. Naturalidade"
            description="A tradução deve soar natural em português brasileiro, evitando anglicismos desnecessários."
            example="✅ 'Atraso no desenvolvimento' ❌ 'Delay no desenvolvimento'"
          />
          
          <GuidelineCard
            icon="📚"
            title="3. Consistência"
            description="Mantenha consistência com traduções existentes. Consulte o histórico de termos similares."
            example="Se 'Abnormality of the heart' → 'Anormalidade cardíaca', mantenha 'cardíaca' em termos relacionados"
          />
          
          <GuidelineCard
            icon="⚖️"
            title="4. Neutralidade"
            description="Evite termos pejorativos ou estigmatizantes. Use linguagem respeitosa e pessoa-primeiro quando apropriado."
            example="✅ 'Pessoa com deficiência intelectual' ❌ 'Retardado mental'"
          />
        </div>
      </section>

      {/* Regras de Formatação */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#1f2937',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          📝 Regras de Formatação
        </h2>
        
        <ul style={{ lineHeight: '1.8', color: '#374151' }}>
          <li><strong>Maiúsculas:</strong> Use apenas na primeira letra (exceto nomes próprios e siglas)</li>
          <li><strong>Hífens:</strong> Siga as regras do português brasileiro (ex: "pré-natal", "pós-operatório")</li>
          <li><strong>Números:</strong> Mantenha números e unidades conforme o original</li>
          <li><strong>Siglas:</strong> Mantenha siglas internacionais conhecidas, adicione tradução entre parênteses se necessário</li>
          <li><strong>Pontuação:</strong> Não adicione ponto final em labels curtos</li>
        </ul>
      </section>

      {/* Casos Específicos */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#1f2937',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          🔍 Casos Específicos
        </h2>
        
        <div style={{ 
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: '600' }}>
            Anatomia
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#e5e7eb' }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #d1d5db' }}>Inglês</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #d1d5db' }}>Português ✅</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #d1d5db' }}>Evitar ❌</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Heart</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Coração</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Cardíaco (usar como adjetivo)</td>
              </tr>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Kidney</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Rim</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Renal (usar como adjetivo)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Liver</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Fígado</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Hepático (usar como adjetivo)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: '600' }}>
            Prefixos e Sufixos Médicos
          </h3>
          <ul style={{ lineHeight: '1.8', marginBottom: 0 }}>
            <li><strong>-itis:</strong> -ite (inflammation → inflamação)</li>
            <li><strong>-osis:</strong> -ose (fibrosis → fibrose)</li>
            <li><strong>hyper-:</strong> hiper- (hypertension → hipertensão)</li>
            <li><strong>hypo-:</strong> hipo- (hypothyroidism → hipotireoidismo)</li>
            <li><strong>-pathy:</strong> -patia (neuropathy → neuropatia)</li>
            <li><strong>-trophy:</strong> -trofia (dystrophy → distrofia)</li>
          </ul>
        </div>
      </section>

      {/* Níveis de Confiança */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#1f2937',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          ⭐ Níveis de Confiança
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ConfidenceLevel
            stars="⭐"
            title="1 Estrela - Baixa Confiança"
            description="Use quando não tiver certeza da tradução ou precisar de revisão especializada."
          />
          <ConfidenceLevel
            stars="⭐⭐"
            title="2 Estrelas - Média-Baixa"
            description="Tradução parcial ou quando houver dúvidas sobre nuances técnicas."
          />
          <ConfidenceLevel
            stars="⭐⭐⭐"
            title="3 Estrelas - Média (Padrão)"
            description="Tradução correta mas sem consulta a fontes especializadas."
          />
          <ConfidenceLevel
            stars="⭐⭐⭐⭐"
            title="4 Estrelas - Alta"
            description="Tradução verificada com literatura médica ou glossários especializados."
          />
          <ConfidenceLevel
            stars="⭐⭐⭐⭐⭐"
            title="5 Estrelas - Muito Alta"
            description="Termo consagrado na literatura brasileira, verificado com múltiplas fontes."
          />
        </div>
      </section>

      {/* Recursos */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#1f2937',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          📚 Recursos Recomendados
        </h2>
        
        <ul style={{ lineHeight: '1.8', color: '#374151' }}>
          <li><strong>DeCS (Descritores em Ciências da Saúde):</strong> biblioteca.bireme.br/vocabulario</li>
          <li><strong>Portal da Língua Portuguesa:</strong> www.portaldalinguaportuguesa.org</li>
          <li><strong>Terminologia Anatômica Internacional:</strong> Referência para termos anatômicos</li>
          <li><strong>Sociedade Brasileira de Genética Médica:</strong> www.sbgm.org.br</li>
          <li><strong>PubMed/MEDLINE:</strong> Artigos científicos em português brasileiro</li>
        </ul>
      </section>

      {/* Processo de Validação */}
      <section style={{ 
        backgroundColor: '#dcfce7',
        padding: '24px',
        borderRadius: '12px',
        borderLeft: '4px solid #22c55e'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>
          ✅ Processo de Validação
        </h2>
        <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Revisão de Pares:</strong> Todas as traduções são revisadas por pelo menos 2 validadores</li>
          <li><strong>Revisão por Comitê:</strong> Termos complexos passam por revisão do comitê de especialistas</li>
          <li><strong>Sincronização HPO:</strong> Traduções aprovadas são sincronizadas com o repositório oficial</li>
          <li><strong>Feedback Contínuo:</strong> Sistema de rejeição com feedback detalhado para melhoria</li>
        </ol>
      </section>

      {/* Footer */}
      <div style={{ 
        marginTop: '48px',
        padding: '24px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          💡 <strong>Dica:</strong> Em caso de dúvida, é melhor marcar uma confiança mais baixa 
          e deixar para revisão especializada do que assumir uma tradução incorreta.
        </p>
        <p style={{ marginTop: '12px', marginBottom: 0, color: '#6b7280', fontSize: '14px' }}>
          Estas diretrizes são constantemente atualizadas. Última atualização: Outubro 2025
        </p>
      </div>
    </div>
  );
};

// Helper Components
const GuidelineCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  example: string;
}> = ({ icon, title, description, example }) => (
  <div style={{ 
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <span style={{ fontSize: '32px' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h3>
    </div>
    <p style={{ margin: '0 0 12px 0', lineHeight: '1.6', color: '#4b5563' }}>
      {description}
    </p>
    <div style={{ 
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#1f2937'
    }}>
      {example}
    </div>
  </div>
);

const ConfidenceLevel: React.FC<{
  stars: string;
  title: string;
  description: string;
}> = ({ stars, title, description }) => (
  <div style={{ 
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  }}>
    <div style={{ fontSize: '24px', minWidth: '80px' }}>{stars}</div>
    <div>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
        {description}
      </p>
    </div>
  </div>
);

export default GuidelinesPage;
