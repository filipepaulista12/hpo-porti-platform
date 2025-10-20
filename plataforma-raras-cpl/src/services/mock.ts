// Mock data para desenvolvimento quando backend não está disponível
export const mockStats = {
  totalTerms: 17020,
  translatedTerms: 7214,
  pendingValidation: 7214,
  needTranslation: 9806,
  activeTranslators: 156,
  completedToday: 23
};

export const mockUser = {
  id: 'mock-user-1',
  email: 'demo@exemplo.com',
  name: 'Dr. João Silva',
  role: 'TRANSLATOR' as const,
  points: 1250,
  level: 3,
  streak: 7,
  institution: 'Hospital das Clínicas',
  specialty: 'Geneticista',
  country: 'Brasil'
};

export const mockLeaderboard = [
  { id: '1', name: 'Dr. Maria Santos', points: 2450, translations: 89 },
  { id: '2', name: 'Dr. João Silva', points: 1250, translations: 45 },
  { id: '3', name: 'Dra. Ana Costa', points: 980, translations: 32 }
];

export const mockTerms = [
  {
    id: '1',
    code: 'HP:0001298',
    labelEn: 'Encephalopathy',
    definitionEn: 'A disorder of the brain that alters brain function or structure.',
    labelPt: 'Encefalopatia',
    definitionPt: 'Distúrbio do cérebro que altera a função ou estrutura cerebral.',
    status: 'LEGACY_PENDING',
    category: 'Neurologia',
    difficulty: 3,
    isLegacy: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    code: 'HP:0001250',
    labelEn: 'Seizures',
    definitionEn: 'Seizures are episodes of abnormal motor, sensory, autonomic, or psychic events.',
    status: 'NOT_TRANSLATED',
    category: 'Neurologia',
    difficulty: 2,
    isLegacy: false,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    code: 'HP:0000252',
    labelEn: 'Microcephaly',
    definitionEn: 'Occipito-frontal (head) circumference (OFC) more than 3 standard deviations below the mean.',
    labelPt: 'Microcefalia',
    definitionPt: 'Circunferência occipito-frontal (cabeça) mais de 3 desvios padrão abaixo da média.',
    status: 'APPROVED',
    category: 'Desenvolvimento',
    difficulty: 4,
    isLegacy: false,
    createdAt: '2024-01-15T10:30:00Z'
  }
];

export const mockBadges = [
  { id: '1', name: 'Primeira Tradução', description: 'Primeira contribuição', icon: '🎉' },
  { id: '2', name: 'Em Chamas', description: '7 dias consecutivos', icon: '🔥' },
  { id: '3', name: 'Especialista', description: '100 traduções aprovadas', icon: '⭐' }
];

// Simular delay de rede
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));