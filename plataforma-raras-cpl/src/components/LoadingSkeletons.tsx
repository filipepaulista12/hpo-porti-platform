/**
 * Loading Skeleton Components
 * Reusable skeleton loaders for different UI elements
 */

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = ''
}: SkeletonProps) => (
  <div 
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: '#E5E7EB',
      background: 'linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  />
);

// Card skeleton for term lists
export const TermCardSkeleton = () => (
  <div style={{
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <Skeleton width="120px" height="24px" />
      <Skeleton width="80px" height="24px" borderRadius="12px" />
    </div>
    <div style={{ marginBottom: '8px' }}>
      <Skeleton width="100%" height="20px" />
    </div>
    <div style={{ marginBottom: '8px' }}>
      <Skeleton width="80%" height="16px" />
    </div>
    <Skeleton width="60%" height="16px" />
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <Skeleton width="100px" height="36px" borderRadius="6px" />
      <Skeleton width="100px" height="36px" borderRadius="6px" />
    </div>
  </div>
);

// List of term card skeletons
export const TermListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <TermCardSkeleton key={i} />
    ))}
  </div>
);

// Translation history card skeleton
export const TranslationCardSkeleton = () => (
  <div style={{
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <Skeleton width="150px" height="24px" />
      <Skeleton width="90px" height="28px" borderRadius="14px" />
    </div>
    <div style={{ marginBottom: '8px' }}>
      <Skeleton width="100%" height="18px" />
    </div>
    <div style={{ marginBottom: '8px' }}>
      <Skeleton width="90%" height="16px" />
    </div>
    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
      <Skeleton width="80px" height="14px" />
      <Skeleton width="100px" height="14px" />
      <Skeleton width="70px" height="14px" />
    </div>
  </div>
);

// Conflict card skeleton
export const ConflictCardSkeleton = () => (
  <div style={{
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <Skeleton width="80px" height="24px" borderRadius="12px" />
      <Skeleton width="120px" height="20px" />
    </div>
    <div style={{ marginBottom: '8px' }}>
      <Skeleton width="100%" height="18px" />
    </div>
    <div style={{ marginBottom: '16px' }}>
      <Skeleton width="70%" height="16px" />
    </div>
    <div style={{ display: 'flex', gap: '12px' }}>
      <Skeleton width="120px" height="36px" borderRadius="6px" />
      <Skeleton width="100px" height="36px" borderRadius="6px" />
    </div>
  </div>
);

// Metrics card skeleton
export const MetricsCardSkeleton = () => (
  <div style={{
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <Skeleton width="120px" height="20px" />
      <Skeleton width="40px" height="40px" borderRadius="50%" />
    </div>
    <div style={{ marginBottom: '8px' }}>
      <Skeleton width="100px" height="36px" />
    </div>
    <Skeleton width="150px" height="16px" />
  </div>
);

// Leaderboard entry skeleton
export const LeaderboardEntrySkeleton = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    marginBottom: '12px'
  }}>
    <div style={{ marginRight: '16px' }}>
      <Skeleton width="40px" height="40px" />
    </div>
    <div style={{ marginRight: '16px' }}>
      <Skeleton width="50px" height="50px" borderRadius="50%" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ marginBottom: '8px' }}>
        <Skeleton width="180px" height="20px" />
      </div>
      <Skeleton width="120px" height="16px" />
    </div>
    <Skeleton width="80px" height="24px" />
  </div>
);

// Add shimmer animation
export const SkeletonStyles = () => (
  <style>{`
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .skeleton {
      position: relative;
      overflow: hidden;
    }
  `}</style>
);
