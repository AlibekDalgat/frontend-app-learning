import React, { useState, useEffect, useRef } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { IconButton, Button } from '@openedx/paragon';
import { QuestionAnswerOutline, Close, Send, Delete } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getSession, sendMessage, clearHistory } from './api';
import messages from './messages';
import './AIAssistantWidget.scss';

const AIAssistantWidget = () => {
  const intl = useIntl();
  const config = getConfig();

  if (!config.ENABLE_AI_ASSISTANT_WIDGET) return null;

  const [isOpen, setIsOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ai_assistant') === 'open';
  });
  const [session, setSession] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const chatRef = useRef(null);

  const getContextKey = () => {
    const path = window.location.pathname;
    const match = path.match(/\/course\/([^/]+)/);
    return match ? match[1] : 'global';
  };

  useEffect(() => {
    if (isOpen) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('ai_assistant')) {
        url.searchParams.delete('ai_assistant');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || session || sessionError) return;

    const contextKey = getContextKey();
    getSession(contextKey)
      .then(data => {
        setSession(data);
        setMessagesList(data.history || []);
      })
      .catch(err => {
        console.error('AI Session error:', err);
        setSessionError(true);
      });
  }, [isOpen, session, sessionError]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messagesList, isLoading, sessionError]);

  const getContextInfo = () => {
    const path = window.location.pathname;
    const courseMatch = path.match(/\/course\/([^/]+)/);
    const courseId = courseMatch ? courseMatch[1] : null;
    const segments = path.split('/');
    const lessonId = segments.find(s => s.includes('type@vertical')) || null;

    return { courseId, lessonId };
  };

  const handleSend = async () => {
    if (!input.trim() || !session || isLoading) return;

    const currentInput = input.trim();
    const { courseId, lessonId } = getContextInfo();

    setMessagesList(prev => [
      ...prev,
      { role: 'user', content: currentInput },
      { role: 'assistant', content: '', sources: [], isLoading: true }
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(
        session.rag_session_id,
        currentInput,
        courseId,
        lessonId
      );

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedSources = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let pos;
        while ((pos = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, pos);
          buffer = buffer.slice(pos + 2);

          if (rawEvent.startsWith('data: ')) {
            const dataStr = rawEvent.replace(/^data:\s*/, '');
            if (!dataStr || dataStr.includes('[DONE]')) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.event === 'text_chunk' && typeof data.chunk === 'string') {
                accumulatedContent += data.chunk;
                setMessagesList(prev => {
                  const newList = [...prev];
                  const lastIdx = newList.length - 1;
                  if (lastIdx >= 0) {
                    newList[lastIdx] = { ...newList[lastIdx], content: accumulatedContent, isLoading: false };
                  }
                  return newList;
                });
              } else if (data.event === 'metadata' && data.sources) {
                accumulatedSources = data.sources;
                setMessagesList(prev => {
                  const newList = [...prev];
                  const lastIdx = newList.length - 1;
                  if (lastIdx >= 0) {
                    newList[lastIdx] = { ...newList[lastIdx], sources: accumulatedSources };
                  }
                  return newList;
                });
              }
            } catch (e) {
              console.warn('Ошибка парсинга чанка:', e);
            }
          }
        }
      }
    } catch (err) {
      const is429 = err.response?.status === 429 || err.error === 'token_limit';
      setMessagesList(prev => {
        const newList = [...prev];
        const lastIdx = newList.length - 1;
        newList[lastIdx] = {
          role: 'assistant',
          content: is429 ? intl.formatMessage(messages.errorTokenLimit) : intl.formatMessage(messages.errorGeneral),
          errorType: is429 ? 'token_limit' : 'generic_error',
          isError: true,
          isLoading: false
        };
        return newList;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearHistory(session.rag_session_id);
      setSession(null);
      setMessagesList([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      setMessagesList(prev => [...prev, {
        role: 'assistant',
        content: 'Не удалось очистить историю чата.',
        isError: true,
        errorType: 'generic_error'
      }]);
    }
  };

  const MessageBubble = ({ msg, isGreeting = false }) => {
    const isUser = msg.role === 'user';
    let bubbleClass = `message-bubble ${isUser ? 'user' : 'assistant'}`;

    if (isGreeting) bubbleClass += ' greeting';
    if (msg.isError) {
      bubbleClass += msg.errorType === 'token_limit' ? ' error-token' : ' error';
    }

    return (
      <div className={bubbleClass}>
        <div>{msg.content}</div>
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="sources-container">
            <div className="sources-title">Источники:</div>
            <ul>
              {msg.sources.map((src, idx) => (
                <li key={idx}>
                  <a href={`${config.LMS_BASE_URL}${src.url}`} target="_blank" rel="noopener noreferrer">
                    {src.citation_marker || `[${idx + 1}]`} {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderGreeting = () => {
    if (messagesList.length > 0 || isLoading || sessionError) return null;
    const isGlobal = getContextKey() === 'global';
    const siteName = config.SITE_NAME || 'нашей платформе';

    let text = intl.formatMessage(messages.welcomeGlobal, { siteName });
    if (!isGlobal) text += intl.formatMessage(messages.welcomeCourse);

    return <MessageBubble isGreeting={true} msg={{ role: 'assistant', content: text }} />;
  };

  return (
    <>
      <IconButton
        src={QuestionAnswerOutline}
        iconAs={QuestionAnswerOutline}
        onClick={() => setIsOpen(!isOpen)}
        className="ai-assistant-toggle"
        size="lg"
      />

      {isOpen && (
        <div className="ai-assistant-container">
          <div className="ai-assistant-header">
            <strong>{intl.formatMessage(messages.aiAssistant)}</strong>
            <IconButton src={Close} iconAs={Close} onClick={() => setIsOpen(false)} size="sm" variant="tertiary" />
          </div>

          <div ref={chatRef} className="ai-assistant-messages">
            {sessionError ? (
              <div className="session-error-banner">
                Ошибка загрузки истории чата. ИИ временно недоступен.
              </div>
            ) : (
              <>
                {renderGreeting()}
                {messagesList.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {isLoading && <div className="text-muted small">ИИ печатает...</div>}
              </>
            )}
          </div>

          <div className="ai-assistant-footer">
            <div className="delete-controls">
              {!showDeleteConfirm ? (
                <IconButton
                  src={Delete}
                  iconAs={Delete}
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                  variant="tertiary"
                  aria-label={intl.formatMessage(messages.clearHistory)}
                />
              ) : (
                <div className="d-flex gap-2 align-items-center animate__animated animate__fadeInLeft">
                  <Button variant="danger" size="sm" onClick={handleClear}>{intl.formatMessage(messages.clearHistory)}</Button>
                  <Button variant="tertiary" size="sm" style={{ marginLeft: '3px' }} onClick={() => setShowDeleteConfirm(false)}>{intl.formatMessage(messages.cancelClearHistory)}</Button>
                </div>
              )}
            </div>

            <div className="input-row">
              <input
                type="text"
                className="form-control"
                placeholder={intl.formatMessage(messages.typeMessage)}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => (e.key === 'Enter' && handleSend())}
                disabled={isLoading || !!sessionError}
              />
              <IconButton
                src={Send}
                iconAs={Send}
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !!sessionError}
                variant="primary"
                size="lg"
                className="send-button"
              />
            </div>
            <div className="all-chats-link text-center">
              <a href={`${getConfig().LEARNER_HOME_BASE_URL}ai-assistant`} target="_blank" rel="noopener noreferrer">
                Все чаты с ИИ-ассистентом
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;