import React, { useState, useEffect } from 'react';
import ToastService from '../../services/toast.service';
import ErrorTranslator from '../../utils/ErrorTranslator';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    specialty?: string;
  };
  replies: Comment[];
}

interface CommentsSectionProps {
  translationId: string;
  currentUserId: string;
  apiBaseUrl: string;
  authHeader: Record<string, string>;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  translationId,
  currentUserId,
  apiBaseUrl,
  authHeader
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [totalComments, setTotalComments] = useState(0);
  const [totalReplies, setTotalReplies] = useState(0);

  // Load comments
  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/comments/translation/${translationId}`,
        { headers: authHeader }
      );
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setTotalComments(data.totalComments || 0);
        setTotalReplies(data.totalReplies || 0);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [translationId]);

  // Post new comment
  const postComment = async () => {
    if (newComment.trim().length < 3) {
      ToastService.error('O comentário deve ter pelo menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/comments`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translationId,
          content: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        loadComments();
        ToastService.success('Comentário publicado com sucesso!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao postar comentário');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      ToastService.error(ErrorTranslator.translate(error));
    }
  };

  // Post reply
  const postReply = async (parentId: string) => {
    if (replyContent.trim().length < 3) {
      ToastService.error('A resposta deve ter pelo menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/comments`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translationId,
          content: replyContent.trim(),
          parentId
        })
      });

      if (response.ok) {
        setReplyingTo(null);
        setReplyContent('');
        loadComments();
        ToastService.success('Resposta publicada com sucesso!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao postar resposta');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      ToastService.error(ErrorTranslator.translate(error));
    }
  };

  // Edit comment
  const editComment = async (commentId: string) => {
    if (editContent.trim().length < 3) {
      ToastService.error('O comentário deve ter pelo menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() })
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        loadComments();
        ToastService.success('Comentário editado com sucesso!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao editar comentário');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      ToastService.error(ErrorTranslator.translate(error));
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeader
      });

      if (response.ok) {
        loadComments();
        ToastService.success('Comentário deletado com sucesso!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar comentário');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      ToastService.error(ErrorTranslator.translate(error));
    }
  };

  // Render a single comment
  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isAuthor = comment.user.id === currentUserId;
    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div
        key={comment.id}
        style={{
          backgroundColor: isReply ? '#f8fafc' : 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
          marginLeft: isReply ? '30px' : '0'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {comment.user.avatarUrl ? (
              <img
                src={comment.user.avatarUrl}
                alt={comment.user.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                {comment.user.name}
              </div>
              {comment.user.specialty && (
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {comment.user.specialty}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {new Date(comment.createdAt).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div style={{ marginBottom: '8px' }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '60px',
                resize: 'vertical'
              }}
              maxLength={2000}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => editComment(comment.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                💾 Salvar
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditContent('');
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#334155', fontSize: '14px', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isReply && (
              <button
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyContent('');
                }}
                style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                💬 Responder
              </button>
            )}
            {isAuthor && (
              <>
                <button
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                  style={{
                    fontSize: '12px',
                    color: '#f59e0b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => deleteComment(comment.id)}
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  🗑️ Deletar
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escreva sua resposta..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '60px',
                resize: 'vertical'
              }}
              maxLength={2000}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => postReply(comment.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                💬 Responder
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Render Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
        💬 Comentários ({totalComments + totalReplies})
      </h3>

      {/* New Comment Form */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário construtivo..."
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '80px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
          maxLength={2000}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {newComment.length}/2000 caracteres
          </span>
          <button
            onClick={postComment}
            disabled={newComment.trim().length < 3}
            style={{
              padding: '8px 16px',
              backgroundColor: newComment.trim().length < 3 ? '#cbd5e1' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: newComment.trim().length < 3 ? 'not-allowed' : 'pointer'
            }}
          >
            💬 Comentar
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
          Carregando comentários...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>💬</div>
          <div>Seja o primeiro a comentar!</div>
        </div>
      ) : (
        <div>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
