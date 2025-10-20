import React, { useState } from 'react';

interface EhealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (score: number, answers: number[]) => void;
  initialAnswers?: number[];
}

// eHEALS (eHealth Literacy Scale) - Norman & Skinner (2006)
// 8 questions, Likert scale 1-5, total score 8-40
const EHEALS_QUESTIONS = [
  {
    id: 1,
    text: 'Eu sei quais recursos de saúde estão disponíveis na internet',
    category: 'Conhecimento'
  },
  {
    id: 2,
    text: 'Eu sei onde encontrar recursos úteis de saúde na internet',
    category: 'Conhecimento'
  },
  {
    id: 3,
    text: 'Eu sei como encontrar recursos úteis de saúde na internet',
    category: 'Habilidade'
  },
  {
    id: 4,
    text: 'Eu sei como usar a internet para responder minhas questões sobre saúde',
    category: 'Habilidade'
  },
  {
    id: 5,
    text: 'Eu sei como usar informações de saúde da internet para me ajudar',
    category: 'Aplicação'
  },
  {
    id: 6,
    text: 'Eu tenho as habilidades necessárias para avaliar os recursos de saúde que encontro na internet',
    category: 'Avaliação'
  },
  {
    id: 7,
    text: 'Eu sei diferenciar recursos de saúde de alta e baixa qualidade na internet',
    category: 'Avaliação'
  },
  {
    id: 8,
    text: 'Eu me sinto confiante em usar informações da internet para tomar decisões sobre saúde',
    category: 'Confiança'
  }
];

const LIKERT_OPTIONS = [
  { value: 1, label: 'Discordo Totalmente', color: '#ef4444' },
  { value: 2, label: 'Discordo', color: '#f97316' },
  { value: 3, label: 'Neutro', color: '#eab308' },
  { value: 4, label: 'Concordo', color: '#84cc16' },
  { value: 5, label: 'Concordo Totalmente', color: '#22c55e' }
];

export const EhealsModal: React.FC<EhealsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialAnswers = []
}) => {
  const [answers, setAnswers] = useState<number[]>(
    initialAnswers.length === 8 ? initialAnswers : Array(8).fill(0)
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);

  if (!isOpen) return null;

  const handleAnswer = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    return answers.reduce((sum, answer) => sum + answer, 0);
  };

  const getInterpretation = (score: number) => {
    if (score >= 8 && score <= 20) {
      return {
        level: 'Baixa',
        color: '#ef4444',
        description: 'Você pode se beneficiar de treinamento adicional em busca e avaliação de informações de saúde online.',
        icon: '📉'
      };
    } else if (score >= 21 && score <= 32) {
      return {
        level: 'Moderada',
        color: '#f59e0b',
        description: 'Você tem habilidades adequadas, mas há espaço para melhorias na avaliação crítica de informações de saúde.',
        icon: '📊'
      };
    } else {
      return {
        level: 'Alta',
        color: '#22c55e',
        description: 'Excelente! Você demonstra alta competência em encontrar, avaliar e usar informações de saúde online.',
        icon: '📈'
      };
    }
  };

  const isComplete = answers.every(answer => answer > 0);
  const score = calculateScore();
  const interpretation = getInterpretation(score);
  const progress = answers.filter(a => a > 0).length;

  const handleSave = () => {
    if (isComplete) {
      onSave(score, answers);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '30px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '20px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
          
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700' }}>
            📱 Avaliação de Literacia Digital em Saúde
          </h2>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '14px' }}>
            eHealth Literacy Scale (eHEALS) - Norman & Skinner (2006)
          </p>
          
          {/* Progress Bar */}
          <div style={{
            marginTop: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: 'white',
              height: '100%',
              width: `${(progress / 8) * 100}%`,
              transition: 'width 0.3s ease',
              borderRadius: '8px'
            }} />
          </div>
          <div style={{ 
            marginTop: '10px', 
            fontSize: '13px', 
            opacity: 0.9,
            fontWeight: '600'
          }}>
            {progress} de 8 questões respondidas
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '30px'
        }}>
          {/* Instructions */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '10px' }}>
              📋 Instruções
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
              Avalie cada afirmação de acordo com seu nível de concordância. 
              Esta escala mede sua capacidade de buscar, encontrar e avaliar informações de saúde na internet.
              Não há respostas certas ou erradas - responda com honestidade!
            </p>
          </div>

          {/* Questions */}
          {EHEALS_QUESTIONS.map((question, index) => (
            <div 
              key={question.id}
              style={{
                marginBottom: '30px',
                padding: '25px',
                backgroundColor: answers[index] > 0 ? '#f0fdf4' : '#f9fafb',
                borderRadius: '12px',
                border: answers[index] > 0 ? '2px solid #86efac' : '2px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                <div style={{
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: answers[index] > 0 ? '#22c55e' : '#6366f1',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px'
                }}>
                  {question.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}>
                    {question.category}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    lineHeight: '1.5'
                  }}>
                    {question.text}
                  </div>
                </div>
              </div>

              {/* Likert Scale Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {LIKERT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(index, option.value)}
                    style={{
                      padding: '15px 20px',
                      backgroundColor: answers[index] === option.value ? option.color : 'white',
                      color: answers[index] === option.value ? 'white' : '#374151',
                      border: `2px solid ${answers[index] === option.value ? option.color : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: answers[index] === option.value ? '600' : '500',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (answers[index] !== option.value) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = option.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (answers[index] !== option.value) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${answers[index] === option.value ? 'white' : option.color}`,
                      backgroundColor: answers[index] === option.value ? 'white' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {answers[index] === option.value && (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: option.color
                        }} />
                      )}
                    </div>
                    <span style={{ flex: 1 }}>{option.label}</span>
                    <span style={{ 
                      fontSize: '18px', 
                      opacity: answers[index] === option.value ? 1 : 0.5 
                    }}>
                      {option.value === 1 && '😟'}
                      {option.value === 2 && '🙁'}
                      {option.value === 3 && '😐'}
                      {option.value === 4 && '🙂'}
                      {option.value === 5 && '😃'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Results Section */}
          {isComplete && (
            <div style={{
              marginTop: '30px',
              padding: '30px',
              backgroundColor: interpretation.color + '10',
              border: `2px solid ${interpretation.color}`,
              borderRadius: '12px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                  {interpretation.icon}
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: interpretation.color,
                  marginBottom: '5px'
                }}>
                  Score: {score}/40
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: interpretation.color
                }}>
                  Literacia Digital em Saúde: {interpretation.level}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151'
              }}>
                <strong>Interpretação:</strong> {interpretation.description}
              </div>

              {/* Score Breakdown */}
              <div style={{ marginTop: '20px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '10px'
                }}>
                  Distribuição das Respostas:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {['Conhecimento', 'Habilidade', 'Aplicação', 'Avaliação', 'Confiança'].map((category) => {
                    const categoryQuestions = EHEALS_QUESTIONS.filter(q => q.category === category);
                    const categoryAnswers = categoryQuestions.map(q => answers[q.id - 1]);
                    const categoryScore = categoryAnswers.reduce((sum, a) => sum + a, 0);
                    const categoryMax = categoryQuestions.length * 5;
                    
                    return (
                      <div 
                        key={category}
                        style={{
                          backgroundColor: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                          {category}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: interpretation.color }}>
                          {categoryScore}/{categoryMax}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            disabled={!isComplete}
            style={{
              padding: '12px 24px',
              backgroundColor: isComplete ? '#6366f1' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isComplete ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '14px',
              opacity: isComplete ? 1 : 0.6
            }}
          >
            {isComplete ? '💾 Salvar Resultado' : '⏳ Complete todas as questões'}
          </button>
        </div>
      </div>
    </div>
  );
};
