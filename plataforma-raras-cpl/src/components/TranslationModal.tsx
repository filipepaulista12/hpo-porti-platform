import React, { useRef, useEffect, useState } from 'react';

type Variant = 'PT_BR' | 'PT_PT' | 'PT_AO' | 'PT_MZ' | 'PT_GW' | 'PT_CV' | 'PT_ST' | 'PT_TL' | 'PT_GQ';

interface TranslationModalProps {
  isOpen: boolean;
  selectedTerm: any;
  onClose: () => void;
  onSubmit: (data: {
    translation: string;
    linguisticNotes: string;
    confidence: number;
    selectedVariant: Variant;
  }) => void;
  loading: boolean;
  user: any;
  isMobile: boolean;
}

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  selectedTerm,
  onClose,
  onSubmit,
  loading,
  user,
  isMobile
}) => {
  // ESTADO AGORA FICA DENTRO DO MODAL (não mais no pai!)
  const [translation, setTranslation] = useState('');
  const [linguisticNotes, setLinguisticNotes] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [selectedVariant, setSelectedVariant] = useState<Variant>('PT_BR');
  const [existingTranslations, setExistingTranslations] = useState<any[]>([]);

  // Estado para drag
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const translationInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Limpa os campos quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setTranslation('');
      setLinguisticNotes('');
      setConfidence(3);
      setSelectedVariant('PT_BR');
      setExistingTranslations([]);
      setPosition({ x: 0, y: 0 }); // Reset position
    }
  }, [isOpen]);

  // Auto-focus apenas quando abre
  useEffect(() => {
    if (isOpen && translationInputRef.current) {
      const timer = setTimeout(() => {
        translationInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handlers de drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Não permitir drag em mobile
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const loadExistingTranslations = async (termId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/translations/term/${termId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingTranslations(data);
      }
    } catch (error) {
      console.error('Erro ao carregar traduções:', error);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      translation,
      linguisticNotes,
      confidence,
      selectedVariant
    });
    onClose();
  };

  if (!selectedTerm) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '30px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Draggable */}
        <div 
          onMouseDown={handleMouseDown}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexShrink: 0,
            cursor: isMobile ? 'default' : (isDragging ? 'grabbing' : 'grab'),
            userSelect: 'none',
            padding: '5px 0'
          }}
        >
          <h3 style={{ color: '#1e40af', margin: 0, fontSize: isMobile ? '20px' : '24px' }}>
            {!isMobile && '🔵 '}📝 Traduzir Termo
          </h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '10px'
        }}>
          {/* Termo Original */}
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
              {selectedTerm.hpoId} • {selectedTerm.category || 'Sem categoria'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              EN: {selectedTerm.labelEn}
            </div>
            {selectedTerm.definitionEn && (
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                {selectedTerm.definitionEn}
              </div>
            )}
          </div>

          {/* Load Existing Translations Button */}
          {existingTranslations.length === 0 && (
            <button
              onClick={() => {
                loadExistingTranslations(selectedTerm.id);
                if (user?.nativeVariant) {
                  setSelectedVariant(user.nativeVariant);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                backgroundColor: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                color: '#1e40af',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📚 Ver Traduções Existentes
            </button>
          )}

          {/* Variant Selector */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
              🌍 Variante Linguística da CPLP
            </label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value as Variant)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="PT_BR">🇧🇷 Português do Brasil (PT-BR)</option>
              <option value="PT_PT">🇵🇹 Português de Portugal (PT-PT)</option>
              <option value="PT_AO">🇦🇴 Português de Angola (PT-AO)</option>
              <option value="PT_MZ">🇲🇿 Português de Moçambique (PT-MZ)</option>
              <option value="PT_CV">🇨🇻 Português de Cabo Verde (PT-CV)</option>
              <option value="PT_GW">🇬🇼 Português da Guiné-Bissau (PT-GW)</option>
              <option value="PT_ST">🇸🇹 Português de São Tomé e Príncipe (PT-ST)</option>
              <option value="PT_TL">🇹🇱 Português de Timor-Leste (PT-TL)</option>
              <option value="PT_GQ">🇬🇶 Português da Guiné Equatorial (PT-GQ)</option>
            </select>
          </div>

          {/* Translation Input */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
              Tradução em Português *
            </label>
            <input
              ref={translationInputRef}
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Digite a tradução do termo..."
              autoComplete="off"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Linguistic Notes */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
              💬 Notas Linguísticas (opcional)
            </label>
            <textarea
              value={linguisticNotes}
              onChange={(e) => setLinguisticNotes(e.target.value)}
              placeholder="Justifique sua escolha, explique diferenças regionais, etc..."
              rows={3}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Confidence Slider */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
              Nível de Confiança: {confidence}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              style={{ width: '100%', marginBottom: '5px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
              <span>1 - Baixa</span>
              <span>3 - Média</span>
              <span>5 - Alta</span>
            </div>
          </div>

          {/* Existing Translations */}
          {existingTranslations.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fbbf24'
            }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#92400e', marginBottom: '10px' }}>
                📚 Traduções Existentes ({existingTranslations.length})
              </div>
              {existingTranslations.slice(0, 3).map((trans: any, idx: number) => (
                <div key={idx} style={{
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {trans.variant ? `${trans.variant}: ` : ''}{trans.labelPt}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Por: {trans.user?.name} • Confiança: {trans.confidence}/5
                    {trans.linguisticNotes && ` • ${trans.linguisticNotes}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!translation.trim() || loading}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              minHeight: isMobile ? '44px' : 'auto',
              backgroundColor: !translation.trim() || loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: !translation.trim() || loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Salvando...' : '✅ Salvar Tradução'}
          </button>

          {/* Info sobre Pontos */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#15803d',
            textAlign: 'center'
          }}>
            💎 Você ganhará pontos ao enviar esta tradução!
          </div>
        </div>
      </div>
    </div>
  );
};
